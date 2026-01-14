# app/services/evaluate_test.py
from app.models import (
    CodingTest,
    CodingQuestion,
    TestEvaluation,
    TestSubmission,
    QuestionEvaluation
)
from app.services.judge0 import create_submission, get_result
from app.models.mcq_question import MCQQuestion
import time


def evaluate_test(submission_id, db):
    submission = db.query(TestSubmission).get(submission_id)
    test = db.query(CodingTest).get(submission.test_id)

    total_score = 0
    max_score = 0
    question_rows = []

    difficulty_map = {"Easy": [], "Medium": [], "Hard": []}
    skill_map = {}
    section_map = {}

    start_time = time.time()

    answers = submission.answers or {}

    # ================= EVALUATE CODING QUESTIONS =================
    for qid in test.coding_question_ids:
        question = db.query(CodingQuestion).get(qid)
        code = answers.get(str(qid), "")

        attempted = bool(code.strip())
        passed = 0
        total = len(question.test_cases)

        if attempted:
            for tc in question.test_cases:
                token = create_submission(
                    source_code=code,
                    language_id=71,
                    stdin=tc["input"]
                )
                res = get_result(token)

                if (res.get("stdout") or "").strip() == tc["output"].strip():
                    passed += 1

        score = int((passed / total) * 15) if attempted else 0

        total_score += score
        max_score += 15

        difficulty_map[question.difficulty].append(score)
        skill_map.setdefault(question.technology, []).append(score)
        section_map.setdefault(
            f"Coding - {question.technology}", []
        ).append(score)

        question_rows.append(
            QuestionEvaluation(
                question_id=question.id,
                question_type="CODING",
                difficulty=question.difficulty,
                skill=question.technology,
                max_score=15,
                obtained_score=score,
                attempted=attempted,
                correct=(passed == total),
                time_taken_sec=4
            )
        )

    # ================= EVALUATE MCQ QUESTIONS (✅ FIXED) =================
    for qid in test.mcq_question_ids:
        question = db.query(MCQQuestion).get(qid)

        # ✅ FIX: support BOTH storage formats
        selected = (
            answers.get(str(qid)) or
            answers.get("mcq", {}).get(str(qid))
        )

        attempted = selected is not None
        correct = attempted and selected == question.correct_option
        score = 5 if correct else 0

        total_score += score
        max_score += 5

        difficulty_map[question.difficulty].append(score)
        skill_map.setdefault(question.technology, []).append(score)
        section_map.setdefault("MCQ", []).append(score)

        question_rows.append(
            QuestionEvaluation(
                question_id=question.id,
                question_type="MCQ",
                difficulty=question.difficulty,
                skill=question.technology,
                max_score=5,
                obtained_score=score,
                attempted=attempted,
                correct=correct,
                time_taken_sec=2
            )
        )

    # ================= FINAL SCORE =================
    percentage = (total_score / max_score) * 100 if max_score else 0

    level = (
        "Beginner" if percentage <= 25 else
        "Intermediate" if percentage <= 50 else
        "Experienced" if percentage <= 75 else
        "Proficient"
    )

    # ================= PROCTORING =================
    snapshots = [
        s for s in (submission.proctoring_snapshots or [])
        if isinstance(s.get("image"), str)
        and s["image"].startswith("data:image")
    ]

    window_violations = len(snapshots)
    time_violations = 0

    # ================= DIFFICULTY ANALYSIS =================
    difficulty_analysis = {}

    for level_name, scores in difficulty_map.items():
        if not scores:
            difficulty_analysis[level_name] = {
                "questions": 0,
                "correct": 0,
                "percentage": 0
            }
            continue

        max_possible = 0
        correct_count = 0

        for s in scores:
            if s == 15:
                max_possible += 15
                correct_count += 1
            elif s == 5:
                max_possible += 5
                correct_count += 1
            else:
                max_possible += 15 if s < 5 else 5

        difficulty_analysis[level_name] = {
            "questions": len(scores),
            "correct": correct_count,
            "percentage": round((sum(scores) / max_possible) * 100, 2)
        }

    # ================= SAVE EVALUATION =================
    evaluation = TestEvaluation(
        test_id=test.id,
        student_id=submission.student_id,

        total_score=total_score,
        max_score=max_score,
        percentage=percentage,
        level=level,

        section_analysis=section_map,
        skill_analysis=skill_map,
        difficulty_analysis=difficulty_analysis,

        proctoring_analysis={
            "enabled": True,
            "window_violations": window_violations,
            "time_violations": time_violations,
            "snapshots": snapshots
        },

        test_log={
            "appeared_on": submission.submitted_at.isoformat(),
            "completed_on": submission.submitted_at.isoformat(),
            "report_generated_on": time.strftime("%Y-%m-%d %H:%M:%S")
        },

        time_taken_sec=int(time.time() - start_time)
    )

    db.add(evaluation)
    db.flush()

    for q in question_rows:
        q.evaluation_id = evaluation.id
        db.add(q)

    test.reports += 1
    db.commit()
