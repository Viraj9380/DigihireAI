# app/crud/assessment.py
from typing import List, Optional
from sqlalchemy.orm import Session
from uuid import UUID
from fastapi import HTTPException

from app.models.assessments import Assessment
from app.schemas import AssessmentCreate


def create_assessment(db: Session, assessment_in: AssessmentCreate) -> Assessment:
    a = Assessment(
        job_role=assessment_in.job_role,
        job_description=assessment_in.job_description,
        duration=assessment_in.duration,
        work_experience=assessment_in.work_experience
    )
    db.add(a)
    db.commit()
    db.refresh(a)
    return a


def list_assessments(db: Session) -> List[Assessment]:
    return db.query(Assessment).order_by(Assessment.created_at.desc()).all()


def get_assessment(db: Session, assessment_id: str) -> Optional[Assessment]:
    return db.query(Assessment).filter(Assessment.assessment_id == assessment_id).first()


def update_assessment(db : Session, assessment_id, payload : dict):
    db_obj = db.query(Assessment).filter(Assessment.assessment_id == assessment_id).first()

    for k, v in payload.items():
        setattr(db_obj, k, v)

    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_assessment(db: Session, assessment_id: str) -> dict:
    a = get_assessment(db, assessment_id)
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found")
    db.delete(a)
    db.commit()
    return {"detail": "deleted"}
