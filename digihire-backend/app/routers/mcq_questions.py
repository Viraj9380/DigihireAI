# app/routers/mcq_questions.py

from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.db.database import get_db
from app.models.mcq_question import MCQQuestion

router = APIRouter(
    prefix="/mcq/questions",
    tags=["MCQ Library"]
)

# ===================== SCHEMAS =====================

class MCQQuestionCreate(BaseModel):
    question: str
    options: List[str] = Field(..., min_items=2)
    correct_index: int = Field(..., ge=0)
    difficulty: str = "Medium"
    technology: Optional[str] = None
    question_bank_id: Optional[UUID] = None
    is_system_generated: bool = False


class MCQQuestionOut(BaseModel):
    id: UUID
    question: str
    options: List[str]
    correct_option: str
    difficulty: str
    technology: Optional[str]
    question_bank_id: Optional[UUID] 
    is_system_generated: bool

    class Config:
        orm_mode = True


# ===================== LIST MCQs =====================
@router.get("/")
def list_mcqs(
    system_only: bool | None = None,
    difficulty: str | None = None,
    technology: str | None = None,
    question_bank_id: str | None = None,

    db: Session = Depends(get_db)
):
    query = db.query(MCQQuestion)

    if system_only is True:
        query = query.filter(MCQQuestion.is_system_generated == True)
    if system_only is False:
        query = query.filter(MCQQuestion.is_system_generated == False)
    if difficulty:
        query = query.filter(MCQQuestion.difficulty == difficulty)
    if technology:
        query = query.filter(MCQQuestion.technology == technology)
    if question_bank_id:
        query = query.filter(MCQQuestion.question_bank_id == question_bank_id)

    return query.order_by(MCQQuestion.created_at.desc()).all()


# ===================== CREATE MCQ =====================
@router.post("/", response_model=MCQQuestionOut)
def create_mcq(payload: MCQQuestionCreate, db: Session = Depends(get_db)):
    # Validate correct_index
    if payload.correct_index >= len(payload.options):
        raise HTTPException(
            status_code=400,
            detail="correct_index is out of range of options"
        )

    mcq = MCQQuestion(
        question=payload.question,
        options=payload.options,
        correct_option=payload.options[payload.correct_index],
        difficulty=payload.difficulty,
        technology=payload.technology,
        question_bank_id=payload.question_bank_id,
        is_system_generated=payload.is_system_generated,
    )

    db.add(mcq)
    db.commit()
    db.refresh(mcq)
    return mcq
