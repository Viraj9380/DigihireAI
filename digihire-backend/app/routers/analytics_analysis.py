#app/routers/analytics_analysis.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.models.test_evaluation import TestEvaluation
from app.models.question_evaluation import QuestionEvaluation
from collections import defaultdict

router = APIRouter(prefix="/coding/tests", tags=["Analytics"])


@router.get("/{test_id}/analytics")
def analytics_analysis(test_id: str, db: Session = Depends(get_db)):
    evaluations = (
        db.query(TestEvaluation)
        .filter(TestEvaluation.test_id == test_id)
        .all()
    )

    invites = len(evaluations)
    appeared = len([e for e in evaluations if e.status in ["Evaluated", "Completed"]])
    completed = len([e for e in evaluations if e.status == "Completed"])

    if not evaluations:
        return {
            "invites": 0,
            "appeared": 0,
            "completed": 0,
            "avg_score": 0,
            "avg_time": 0,
            "difficulty_analysis": {},
            "skill_analysis": {},
            "attempt_funnel": {},
            "time_score_map": [],
            "integrity_score": 100
        }

    avg_score = round(sum(e.percentage for e in evaluations) / len(evaluations))
    avg_time = round(sum(e.time_taken_sec or 0 for e in evaluations) / len(evaluations))

    evaluation_ids = [e.id for e in evaluations]

    questions = (
        db.query(QuestionEvaluation)
        .filter(QuestionEvaluation.evaluation_id.in_(evaluation_ids))
        .all()
    )

    # ================= DIFFICULTY =================
    difficulty = defaultdict(lambda: {"questions": 0, "correct": 0})

    for q in questions:
        lvl = q.difficulty or "Unknown"
        difficulty[lvl]["questions"] += 1
        if q.correct:
            difficulty[lvl]["correct"] += 1

    difficulty_analysis = {}
    for lvl, d in difficulty.items():
        accuracy = round((d["correct"] / d["questions"]) * 100) if d["questions"] else 0
        difficulty_analysis[lvl] = {
            "questions": d["questions"],
            "correct": d["correct"],
            "percentage": accuracy
        }

    # ================= SKILLS =================
    skill_map = defaultdict(lambda: {"questions": 0, "correct": 0})

    for q in questions:
        skill = q.skill or "General"
        skill_map[skill]["questions"] += 1
        if q.correct:
            skill_map[skill]["correct"] += 1

    skill_analysis = {}
    for skill, d in skill_map.items():
        accuracy = round((d["correct"] / d["questions"]) * 100) if d["questions"] else 0
        skill_analysis[skill] = accuracy

    # ================= ATTEMPT FUNNEL =================
    attempted = len([q for q in questions if q.attempted])
    correct = len([q for q in questions if q.correct])

    attempt_funnel = {
        "total": len(questions),
        "attempted": attempted,
        "correct": correct
    }

    # ================= TIME VS SCORE =================
    time_score_map = [
        {"time": e.time_taken_sec or 0, "score": e.percentage}
        for e in evaluations
    ]

    # ================= INTEGRITY =================
    violations = 0
    enabled = False

    for e in evaluations:
        if e.proctoring_analysis:
            enabled = True
            violations += (
                e.proctoring_analysis.get("window_violations", 0) * 10 +
                e.proctoring_analysis.get("time_violations", 0) * 5
            )

    integrity_score = max(100 - violations, 0) if enabled else 100

    return {
        "invites": invites,
        "appeared": appeared,
        "completed": completed,
        "avg_score": avg_score,
        "avg_time": avg_time,
        "difficulty_analysis": difficulty_analysis,
        "skill_analysis": skill_analysis,
        "attempt_funnel": attempt_funnel,
        "time_score_map": time_score_map,
        "integrity_score": integrity_score
    }
