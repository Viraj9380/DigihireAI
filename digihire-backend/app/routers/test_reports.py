# app/routers/test_reports.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.test_evaluation import TestEvaluation
from app.models.student import Student

router = APIRouter(prefix="/coding/tests", tags=["Test Reports"])

@router.get("/{test_id}/reports")
def get_test_reports(test_id: str, db: Session = Depends(get_db)):
    rows = (
        db.query(TestEvaluation, Student)
        .join(Student, Student.id == TestEvaluation.student_id)
        .filter(TestEvaluation.test_id == test_id)
        .all()
    )

    

    return [
        {
            "evaluation_id": e.id,
            "name": s.full_name,
            "email": s.email,
            "score": {"raw": f"{e.total_score}/{e.max_score}", "percentage": round(e.percentage, 2)},
            "status": f"Evaluated on {e.test_log.get('completed_on')}",
            "proctoring": "Enabled" if e.proctoring_analysis.get("enabled") else "Disabled",
            "appeared_on": e.test_log.get("appeared_on"),
            "violations": {
                "window": e.proctoring_analysis.get("window_violations", 0),
                "time": e.proctoring_analysis.get("time_violations", 0),
                "total": (
                    e.proctoring_analysis.get("window_violations", 0)
                    + e.proctoring_analysis.get("time_violations", 0)
                )
            }
        }
        for e, s in rows
    ]
