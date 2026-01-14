# app/routers/coding_tests.py
from fastapi import APIRouter, Depends, HTTPException
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
    proctoring_mode: str = "NO_PROCTORING"
    duration_minutes: int = 30


class AddQuestionsPayload(BaseModel):
    coding_question_ids: List[str] = []
    mcq_question_ids: List[str] = []


class TestSettingsUpdate(BaseModel):
    title: str | None = None
    duration_minutes: int | None = None
    allow_copy_paste: bool | None = None
    terminate_on_violation: bool | None = None
    max_violations: int | None = None
    shuffle_questions: bool | None = None


@router.post("/")
def create_test(payload: TestCreate, db: Session = Depends(get_db)):
    test = CodingTest(
        title=payload.title,
        job_role=payload.job_role,
        proctoring_mode=payload.proctoring_mode,
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
def add_questions(
    test_id: UUID,
    question_ids: List[str],
    db: Session = Depends(get_db)
):
    test = db.query(CodingTest).filter(CodingTest.id == test_id).first()

    if not test:
        return {"error": "Test not found"}

    existing = set(test.coding_question_ids)
    updated = list(existing.union(set(question_ids)))

    test.coding_question_ids = updated
    db.commit()

    return {"added": len(question_ids)}

@router.post("/{test_id}/remove-questions")
def remove_questions(
    test_id: UUID,
    question_ids: List[str],
    db: Session = Depends(get_db)
):
    test = db.query(CodingTest).filter(CodingTest.id == test_id).first()

    if not test:
        return {"error": "Test not found"}

    # remove selected ids
    test.coding_question_ids = [
        qid for qid in test.coding_question_ids
        if qid not in question_ids
    ]

    db.commit()
    return {"removed": len(question_ids)}


@router.delete("/{test_id}")
def delete_test(test_id: UUID, db: Session = Depends(get_db)):
    test = db.query(CodingTest).filter(CodingTest.id == test_id).first()

    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    db.delete(test)
    db.commit()

    return {
        "message": "Test deleted successfully",
        "test_id": test_id
    }



@router.put("/coding/tests/{test_id}")
def update_test_settings(
    test_id: str,
    payload: TestSettingsUpdate,
    db: Session = Depends(get_db)
):
    test = db.query(CodingTest).filter(CodingTest.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    for key, value in payload.dict(exclude_unset=True).items():
        setattr(test, key, value)

    db.commit()
    db.refresh(test)
    return test





# app/routers/coding_tests.py

@router.post("/{test_id}/add-mcq-questions")
def add_mcq_questions(
    test_id: UUID,
    question_ids: List[str],
    db: Session = Depends(get_db)
):
    test = db.query(CodingTest).filter(CodingTest.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    existing = set(test.mcq_question_ids or [])
    test.mcq_question_ids = list(existing.union(set(question_ids)))
    db.commit()

    return {"added": len(question_ids)}


@router.post("/{test_id}/remove-mcq-questions")
def remove_mcq_questions(
    test_id: UUID,
    question_ids: List[str],
    db: Session = Depends(get_db)
):
    test = db.query(CodingTest).filter(CodingTest.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    test.mcq_question_ids = [
        qid for qid in test.mcq_question_ids if qid not in question_ids
    ]
    db.commit()

    return {"removed": len(question_ids)}
