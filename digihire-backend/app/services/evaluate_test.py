# app/services/evaluate_test.py
# app/services/evaluate_test.py
import time
from app.models import (
    CodingTest,
    CodingQuestion,
    TestEvaluation,
    TestSubmission,
    QuestionEvaluation
)
from app.models.mcq_question import MCQQuestion
from app.services.judge0 import create_submission, get_result

MAX_CODING_SCORE = 15
MAX_MCQ_SCORE = 5


def evaluate_test(submission_id, db):
    submission = db.query(TestSubmission).get(submission_id)
    test = db.query(CodingTest).get(submission.test_id)

    answers = submission.answers or {}

    total_score = 0
    max_score = (
        len(test.coding_question_ids) * MAX_CODING_SCORE +
        len(test.mcq_question_ids) * MAX_MCQ_SCORE
    )

    question_rows = []

    section_map = {}
    skill_map = {}
    difficulty_map = {"Easy": [], "Medium": [], "Hard": []}

    start_time = time.time()

    # ================= CODING QUESTIONS =================
    for qid in test.coding_question_ids:
        question = db.query(CodingQuestion).get(qid)
        code = answers.get(str(qid), "")

        attempted = bool(code and code.strip())
        total_tc = len(question.test_cases)
        passed_tc = 0
        testcase_results = []

        if attempted:
            for idx, tc in enumerate(question.test_cases):
                token = create_submission(
                    source_code=code,
                    language_id=71,
                    stdin=tc["input"]
                )
                res = get_result(token)

                actual = (res.get("stdout") or "").strip()
                expected = tc["output"].strip()
                passed = actual == expected

                if passed:
                    passed_tc += 1

                testcase_results.append({
                    "index": idx + 1,
                    "passed": passed,
                    "expected": expected,
                    "actual": actual
                })

        score = int((passed_tc / total_tc) * MAX_CODING_SCORE) if attempted else 0
        correct = attempted and passed_tc == total_tc

        total_score += score

        section = f"Coding - {question.technology or 'General'}"
        section_map.setdefault(section, {"score": 0, "max": 0})
        section_map[section]["score"] += score
        section_map[section]["max"] += MAX_CODING_SCORE

        skill_map.setdefault(question.technology or "General", {"score": 0, "max": 0})
        skill_map[question.technology or "General"]["score"] += score
        skill_map[question.technology or "General"]["max"] += MAX_CODING_SCORE

        difficulty_map[question.difficulty].append((score, MAX_CODING_SCORE))

        question_rows.append(
            QuestionEvaluation(
                question_id=question.id,
                question_type="CODING",
                difficulty=question.difficulty,
                skill=question.technology,
                max_score=MAX_CODING_SCORE,
                obtained_score=score,
                attempted=attempted,
                correct=correct,
                time_taken_sec=5,
                testcase_summary={
                    "total": total_tc,
                    "passed": passed_tc,
                    "results": testcase_results
                }
            )
        )

    # ================= MCQ QUESTIONS =================
    for qid in test.mcq_question_ids:
        question = db.query(MCQQuestion).get(qid)

        selected_raw = (
            answers.get(str(qid)) or
            answers.get("mcq", {}).get(str(qid))
        )

        attempted = selected_raw is not None
        selected_option = None

        if attempted:
            if isinstance(selected_raw, int) or (
                isinstance(selected_raw, str) and selected_raw.isdigit()
            ):
                idx = int(selected_raw)
                if 0 <= idx < len(question.options):
                    selected_option = question.options[idx]
            elif isinstance(selected_raw, str):
                selected_option = selected_raw.strip()

        correct = attempted and selected_option == question.correct_option
        score = MAX_MCQ_SCORE if correct else 0

        total_score += score

        section_map.setdefault("MCQ", {"score": 0, "max": 0})
        section_map["MCQ"]["score"] += score
        section_map["MCQ"]["max"] += MAX_MCQ_SCORE

        skill_map.setdefault(question.technology or "General", {"score": 0, "max": 0})
        skill_map[question.technology or "General"]["score"] += score
        skill_map[question.technology or "General"]["max"] += MAX_MCQ_SCORE

        difficulty_map[question.difficulty].append((score, MAX_MCQ_SCORE))

        question_rows.append(
            QuestionEvaluation(
                question_id=question.id,
                question_type="MCQ",
                difficulty=question.difficulty,
                skill=question.technology,
                max_score=MAX_MCQ_SCORE,
                obtained_score=score,
                attempted=attempted,
                correct=correct,
                time_taken_sec=2
            )
        )

    # ================= FINAL METRICS =================
    percentage = round((total_score / max_score) * 100, 2) if max_score else 0

    if percentage <= 30:
        level = "Beginner"
        s_code = "S0"
    elif percentage <= 55:
        level = "Intermediate"
        s_code = "S1"
    elif percentage <= 75:
        level = "Proficient"
        s_code = "S2"
    elif percentage <= 90:
        level = "Advanced"
        s_code = "S3"
    else:
        level = "Expert"
        s_code = "S4"

    # ================= ANALYTICS =================
    section_analysis = {
        k: {
            "score": v["score"],
            "max": v["max"],
            "percentage": round((v["score"] / v["max"]) * 100, 2) if v["max"] else 0
        }
        for k, v in section_map.items()
    }

    skill_analysis = {
        k: {
            "score": v["score"],
            "max": v["max"],
            "percentage": round((v["score"] / v["max"]) * 100, 2) if v["max"] else 0
        }
        for k, v in skill_map.items()
    }

    difficulty_analysis = {}
    for level_name, rows in difficulty_map.items():
        if not rows:
            difficulty_analysis[level_name] = {
                "questions": 0,
                "correct": 0,
                "percentage": 0
            }
            continue

        total_s = sum(s for s, _ in rows)
        total_m = sum(m for _, m in rows)
        correct_cnt = sum(1 for s, m in rows if s == m)

        difficulty_analysis[level_name] = {
            "questions": len(rows),
            "correct": correct_cnt,
            "percentage": round((total_s / total_m) * 100, 2)
        }

    # ================= SAVE EVALUATION =================
    evaluation = TestEvaluation(
        test_id=test.id,
        student_id=submission.student_id,
        total_score=total_score,
        max_score=max_score,
        percentage=percentage,
        level=level,
        section_analysis=section_analysis,
        skill_analysis=skill_analysis,
        difficulty_analysis=difficulty_analysis,
        proctoring_analysis={
            "enabled": True,
            "window_violations": len(submission.proctoring_snapshots or []),
            "time_violations": 0,
            "snapshots": submission.proctoring_snapshots or []
        },
        test_log={
            "appeared_on": submission.submitted_at.isoformat(),
            "completed_on": submission.submitted_at.isoformat(),
            "report_generated_on": time.strftime("%Y-%m-%d %H:%M:%S"),
            "s_code": s_code   # ✅ STORED SAFELY HERE
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
