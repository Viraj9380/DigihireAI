from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.db.database import get_db
from app.models.mcq_question import MCQQuestion

router = APIRouter(prefix="/mcq/questions", tags=["MCQ Library"])



class MCQQuestionCreate(BaseModel):
    question: str
    options: List[str]
    correct_index: int
    difficulty: str = "Medium"


class MCQQuestionOut(MCQQuestionCreate):
    id: UUID



# ================= LIST MCQs =================
@router.get("/")
def list_mcqs(db: Session = Depends(get_db)):
    return db.query(MCQQuestion).order_by(MCQQuestion.created_at.desc()).all()


# ================= CREATE MCQ =================
@router.post("/")
def create_mcq(payload: MCQQuestionCreate, db: Session = Depends(get_db)):
    mcq = MCQQuestion(
        question=payload.question,
        options=payload.options,
        correct_option=payload.options[payload.correct_index],
        difficulty=payload.difficulty,
    )
    db.add(mcq)
    db.commit()
    db.refresh(mcq)
    return mcq