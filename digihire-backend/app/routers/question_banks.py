from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from app.db.database import get_db
from app.models.question_bank import QuestionBank

router = APIRouter(prefix="/question-banks", tags=["Question Banks"])

class QuestionBankCreate(BaseModel):
    name: str
    skill: str | None = None
    question_type: str  # Coding / MCQ

@router.post("/")
def create_question_bank(payload: QuestionBankCreate, db: Session = Depends(get_db)):
    qb = QuestionBank(
        name=payload.name,
        skill=payload.skill,
        question_type=payload.question_type
    )
    db.add(qb)
    db.commit()
    db.refresh(qb)
    return qb

@router.get("/")
def list_question_banks(db: Session = Depends(get_db)):
    return db.query(QuestionBank).order_by(QuestionBank.created_at.desc()).all()
