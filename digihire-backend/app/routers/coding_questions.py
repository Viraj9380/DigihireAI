# app/routers/coding_questions.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from pydantic import BaseModel
from typing import List, Dict, Optional

from app.db.database import get_db
from app.models.coding_question import CodingQuestion

router = APIRouter(prefix="/coding/questions", tags=["Coding Questions"])


class QuestionCreate(BaseModel):
    title: str
    description: str
    input_format: str = ""
    output_format: str = ""
    constraints: str = ""
    sample_input: str = ""
    sample_output: str = ""
    examples: Optional[List[Dict[str, str]]] = []
    testcases: List[Dict[str, str]]


@router.post("/")
def create_question(payload: QuestionCreate, db: Session = Depends(get_db)):
    question = CodingQuestion(
        title=payload.title,
        description=payload.description,
        input_format=payload.input_format,
        output_format=payload.output_format,
        constraints=payload.constraints,
        sample_input=payload.sample_input,
        sample_output=payload.sample_output,
        examples=payload.examples,
        test_cases=payload.testcases,
    )
    db.add(question)
    db.commit()
    db.refresh(question)

    return {"id": str(question.id)}


@router.get("/")
def list_questions(db: Session = Depends(get_db)):
    return db.query(CodingQuestion).order_by(CodingQuestion.created_at.desc()).all()


# ✅ FIXED ROUTE
@router.get("/{question_id}")
def get_question(question_id: UUID, db: Session = Depends(get_db)):
    question = db.query(CodingQuestion).filter(CodingQuestion.id == question_id).first()

    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    return question
