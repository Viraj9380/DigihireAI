# app/routers/analytics_analysis.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.test_evaluation import TestEvaluation

router = APIRouter(prefix="/coding/tests", tags=["Analytics"])

@router.get("/{test_id}/analytics")
def analytics_analysis(test_id: str, db: Session = Depends(get_db)):
    evaluations = db.query(TestEvaluation).filter(
        TestEvaluation.test_id == test_id
    ).all()

    if not evaluations:
        return {
            "avg_score": 0,
            "avg_time": 0,
            "section_analysis": {},
            "skill_analysis": {},
            "difficulty_analysis": {},
            "integrity_score": 100
        }

    avg_score = sum(e.percentage for e in evaluations) / len(evaluations)
    avg_time = sum(e.time_taken_sec for e in evaluations) // len(evaluations)

    e = evaluations[0]
    violations = (
        e.proctoring_analysis.get("window_violations", 0) +
        e.proctoring_analysis.get("time_violations", 0)
    )

    return {
        "avg_score": round(avg_score, 2),
        "avg_time": avg_time,
        "section_analysis": e.section_analysis,
        "skill_analysis": e.skill_analysis,
        "difficulty_analysis": e.difficulty_analysis,
        "integrity_score": max(100 - violations * 10, 0),
        "proctoring": e.proctoring_analysis,
        "test_log": e.test_log
    }
