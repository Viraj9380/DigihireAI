# app/services/evaluate_test.py

from app.models import (
    CodingTest,
    CodingQuestion,
    TestEvaluation,
    TestSubmission,
    QuestionEvaluation
)
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

    # ================= EVALUATE QUESTIONS =================
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

    percentage = (total_score / max_score) * 100 if max_score else 0

    level = (
        "Beginner" if percentage <= 25 else
        "Intermediate" if percentage <= 50 else
        "Experienced" if percentage <= 75 else
        "Proficient"
    )

    # ================= PROCTORING (OPTION A) =================
    # Expected snapshot format:
    # {
    #   "type": "WINDOW_BLUR",
    #   "image": "data:image/png;base64,...",
    #   "timestamp": "ISO"
    # }

    snapshots = [
    s for s in (submission.proctoring_snapshots or [])
    if isinstance(s.get("image"), str)
    and s["image"].startswith("data:image")
]


    window_violations = len(snapshots)
    time_violations = 0

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

        difficulty_analysis={
            k: {
                "questions": len(v),
                "correct": len([x for x in v if x > 0]),
                "percentage": round(
                    (sum(v) / (len(v) * 15)) * 100, 2
                ) if v else 0
            }
            for k, v in difficulty_map.items()
        },

        proctoring_analysis={
            "enabled": True,                # snapshots exist => enabled
            "window_violations": window_violations,
            "time_violations": time_violations,

            # ✅ FULL BASE64 SNAPSHOTS STORED
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


