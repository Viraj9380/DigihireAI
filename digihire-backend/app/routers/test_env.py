# app/routers/test_env.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from pydantic import BaseModel

from app.db.database import get_db
from app.models.coding_test import CodingTest
from app.models.coding_question import CodingQuestion
from app.models.test_submission import TestSubmission
from app.models.mcq_question import MCQQuestion
from app.models.student_access_token import StudentAccessToken
from app.services.evaluate_test import evaluate_test

router = APIRouter(prefix="/test-env", tags=["Test Environment"])


class SubmitPayload(BaseModel):
    student_id: UUID
    answers: dict
    proctoring_snapshots: list = []


@router.get("/{test_id}")
def get_test_env(test_id: UUID, db: Session = Depends(get_db)):
    test = db.query(CodingTest).filter(
        CodingTest.id == test_id
    ).first()

    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    coding_questions = db.query(CodingQuestion).filter(
        CodingQuestion.id.in_(test.coding_question_ids)
    ).all()

    mcq_questions = db.query(MCQQuestion).filter(
        MCQQuestion.id.in_(test.mcq_question_ids)
    ).all()

    return {
        "test": test,
        "mcq_questions": mcq_questions,
        "coding_questions": coding_questions
    }


@router.post("/{test_id}/submit")
def submit_test(
    test_id: UUID,
    payload: SubmitPayload,
    db: Session = Depends(get_db)
):
    test_id_str = str(test_id)
    student_id_str = str(payload.student_id)

    # 🔹 Prevent double submission (FIXED: UUID → STRING)
    existing = db.query(TestSubmission).filter(
        TestSubmission.test_id == test_id_str,
        TestSubmission.student_id == student_id_str
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Test already submitted")

    # 🔹 Save submission (FIXED: UUID → STRING)
    submission = TestSubmission(
        test_id=test_id_str,
        student_id=student_id_str,
        answers=payload.answers,
        proctoring_snapshots=payload.proctoring_snapshots or []
    )
    db.add(submission)

    # 🔹 UPDATE INVITE STATUS → COMPLETED (UUID TABLE → NO CAST)
    token = db.query(StudentAccessToken).filter(
        StudentAccessToken.test_id == test_id,
        StudentAccessToken.student_id == payload.student_id
    ).first()

    if token:
        token.status = "COMPLETED"

    db.commit()
    db.refresh(submission)

    evaluate_test(submission.id, db)

    return {"status": "submitted"}
