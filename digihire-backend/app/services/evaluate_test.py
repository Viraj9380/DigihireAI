# app/services/evaluate_test.py
from app.models import CodingTest, CodingQuestion, TestEvaluation, TestSubmission, QuestionEvaluation
from app.services.judge0 import create_submission, get_result
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

    for qid in test.coding_question_ids:
        question = db.query(CodingQuestion).get(qid)
        code = submission.answers.get(str(qid), "")

        attempted = bool(code.strip())
        passed = 0
        total = len(question.test_cases)

        if attempted:
            for tc in question.test_cases:
                token = create_submission(
                    source_code=code,
                    language_id=71,  # python/js dynamic later
                    stdin=tc["input"]
                )
                res = get_result(token)
                if (res.get("stdout") or "").strip() == tc["output"].strip():
                    passed += 1

        score = int((passed / total) * 15) if attempted else 0

        total_score += score
        max_score += 15

        # Aggregations
        difficulty_map[question.difficulty].append(score)
        skill_map.setdefault(question.technology, []).append(score)
        section_map.setdefault(f"Coding - {question.technology}", []).append(score)

        question_rows.append(
            QuestionEvaluation(
                question_id=question.id,
                question_type="CODING",
                difficulty=question.difficulty,
                skill=question.technology,
                max_score=15,
                obtained_score=score,
                attempted=attempted,
                correct=passed == total,
                time_taken_sec=4
            )
        )

    percentage = (total_score / max_score) * 100 if max_score else 0

    level = (
        "Beginner" if percentage <= 25 else
        "Intermediate" if percentage <= 50 else
        "Experienced" if percentage <= 75 else
        "Proficient"
    )

    evaluation = TestEvaluation(
        test_id=test.id,
        student_id=submission.student_id,
        total_score=total_score,
        max_score=max_score,
        percentage=percentage,
        level=level,
        section_analysis=section_map,
        skill_analysis=skill_map,
        difficulty_analysis={
            k: {
                "questions": len(v),
                "correct": len([x for x in v if x > 0]),
                "percentage": (sum(v) / (len(v) * 15)) * 100 if v else 0
            } for k, v in difficulty_map.items()
        },
        proctoring_analysis={
            "enabled": test.proctoring_mode != "NONE",
            "window_violations": 0,
            "time_violations": 0
        },
        test_log={
            "appeared_on": submission.submitted_at.isoformat(),
            "completed_on": submission.submitted_at.isoformat()
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
