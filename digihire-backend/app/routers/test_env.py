# app/routers/test_env.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from pydantic import BaseModel
from app.db.database import get_db
from app.models.coding_test import CodingTest
from app.models.coding_question import CodingQuestion
from app.models.test_submission import TestSubmission
from app.services.evaluate_test import evaluate_test
router = APIRouter(prefix="/test-env", tags=["Test Environment"])

class SubmitPayload(BaseModel):
    student_id: UUID
    answers: dict  # { questionId: code }
    proctoring_snapshots: list = []

@router.get("/{test_id}")
def get_test_env(test_id: UUID, db: Session = Depends(get_db)):
    test = db.query(CodingTest).filter(CodingTest.id == test_id).first()

    questions = db.query(CodingQuestion).filter(
        CodingQuestion.id.in_(test.coding_question_ids)
    ).all()

    return {
        "test": test,
        "questions": questions
    }

@router.post("/{test_id}/submit")
def submit_test(
    test_id: UUID,
    payload: SubmitPayload,
    db: Session = Depends(get_db)
):
    submission = TestSubmission(
        test_id=test_id,
        student_id=payload.student_id,
        answers=payload.answers,
        proctoring_snapshots=payload.proctoring_snapshots or []  # 🔒 HARD LIMIT
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    evaluate_test(submission.id, db)

    return {"status": "submitted"}
