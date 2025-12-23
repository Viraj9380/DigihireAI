# app/routers/coding_tests.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from uuid import UUID

from app.db.database import get_db
from app.models.coding_test import CodingTest

router = APIRouter(prefix="/coding/tests", tags=["Coding Tests"])
class TestCreate(BaseModel):
    title: str
    job_role: str | None = None
    duration_minutes: int = 30

@router.post("/")
def create_test(payload: TestCreate, db: Session = Depends(get_db)):
    test = CodingTest(
        title=payload.title,
        job_role=payload.job_role,
        duration_minutes=payload.duration_minutes
    )
    db.add(test)
    db.commit()
    db.refresh(test)
    return test

@router.get("/")
def list_tests(db: Session = Depends(get_db)):
    return db.query(CodingTest).order_by(CodingTest.created_at.desc()).all()

@router.post("/{test_id}/add-questions")
def add_questions(test_id: UUID, question_ids: List[str], db: Session = Depends(get_db)):
    test = db.query(CodingTest).filter(CodingTest.id == test_id).first()
    test.questions.extend(question_ids)
    db.commit()
    return {"status": "Questions added"}
