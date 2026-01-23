# app/routers/analytics_analysis.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.test_evaluation import TestEvaluation
from app.models.student import Student

router = APIRouter(prefix="/coding/tests", tags=["Analytics"])


@router.get("/{test_id}/analytics")
def analytics_analysis(test_id: str, db: Session = Depends(get_db)):
    students = db.query(Student).filter(Student.test_id == test_id).all()
    evaluations = db.query(TestEvaluation).filter(
        TestEvaluation.test_id == test_id
    ).all()

    total_invites = len(students)
    appeared = len(evaluations)
    completed = len([e for e in evaluations if e.test_log.get("completed_on")])

    # ===== PIPELINE =====
    candidate_pipeline = {
        "invited": total_invites,
        "appeared": appeared,
        "completed": completed,
    }

    # ===== TEST STATUS =====
    test_status = {
        "completed": completed,
        "left": max(appeared - completed, 0),
        "terminated": 0,
        "suspended": 0,
    }

    if not evaluations:
        return {
            "candidate_pipeline": candidate_pipeline,
            "test_status": test_status,
            "candidate_performance": {},
            "avg_score": 0,
            "avg_time": 0,
            "section_analysis": {},
            "skill_analysis": {},
            "difficulty_analysis": {},
            "integrity_score": 100,
            "proctoring": {},
            "test_log": {}
        }

    avg_score = sum(e.percentage for e in evaluations) / len(evaluations)
    avg_time = sum(e.time_taken_sec for e in evaluations) // len(evaluations)

    # ===== SKILL CATEGORY DISTRIBUTION =====
    skill_bucket = {
        "Beginner": 0,
        "Intermediate": 0,
        "Proficient": 0,
        "Advanced": 0,
        "Expert": 0,
    }

    for e in evaluations:
        p = e.percentage or 0
        if p <= 30:
            skill_bucket["Beginner"] += 1
        elif p <= 55:
            skill_bucket["Intermediate"] += 1
        elif p <= 75:
            skill_bucket["Proficient"] += 1
        elif p <= 90:
            skill_bucket["Advanced"] += 1
        else:
            skill_bucket["Expert"] += 1

    candidate_performance = {
        "appeared": appeared,
        "skill_distribution": skill_bucket,
    }

    e = evaluations[0]
    violations = (
        e.proctoring_analysis.get("window_violations", 0)
        + e.proctoring_analysis.get("time_violations", 0)
    )

    return {
        "candidate_pipeline": candidate_pipeline,
        "test_status": test_status,
        "candidate_performance": candidate_performance,
        "avg_score": round(avg_score, 2),
        "avg_time": avg_time,
        "section_analysis": e.section_analysis,
        "skill_analysis": e.skill_analysis,
        "difficulty_analysis": e.difficulty_analysis,
        "integrity_score": max(100 - violations * 10, 0),
        "proctoring": e.proctoring_analysis,
        "test_log": e.test_log,
    }
