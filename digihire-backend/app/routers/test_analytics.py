from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.test_evaluation import TestEvaluation

router = APIRouter(
    prefix="/coding/tests",
    tags=["Analytics"]
)

@router.get("/{test_id}/analytics")
def get_test_analytics(test_id: str, db: Session = Depends(get_db)):
    evaluations = (
        db.query(TestEvaluation)
        .filter(TestEvaluation.test_id == test_id)
        .all()
    )

    appeared = len(evaluations)
    completed = len([e for e in evaluations if e.status == "COMPLETED"])

    avg_score = (
        sum(e.percentage for e in evaluations) / appeared
        if appeared else 0
    )

    avg_time = (
        sum(e.time_taken_sec for e in evaluations) / appeared
        if appeared else 0
    )

    return {
        "invites": appeared,
        "appeared": appeared,
        "completed": completed,
        "avg_score": round(avg_score, 2),
        "avg_time": round(avg_time, 2)
    }
