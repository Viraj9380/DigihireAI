# app/routers/question_insights.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db

from app.models.question_evaluation import QuestionEvaluation
from app.models.test_evaluation import TestEvaluation
from app.models.coding_question import CodingQuestion
from app.models.mcq_question import MCQQuestion
router = APIRouter(
    prefix="/coding/tests",
    tags=["Question Insights"]
)

@router.get("/{test_id}/question-insights")
def question_insights(test_id: str, db: Session = Depends(get_db)):
    rows = (
        db.query(QuestionEvaluation)
        .join(TestEvaluation, TestEvaluation.id == QuestionEvaluation.evaluation_id)
        .filter(TestEvaluation.test_id == test_id)
        .all()
    )

    results = []

    for e in rows:
        if e.question_type == "CODING":
            q = db.query(CodingQuestion).get(e.question_id)
            title = q.title if q else "Coding Question"
        else:
            q = db.query(MCQQuestion).get(e.question_id)
            title = q.question if q else "MCQ Question"

        results.append({
            "title": title,
            "type": e.question_type,
            "difficulty": e.difficulty,
            "attempted": e.attempted,
            "correct": e.correct
        })

    return results