from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db

from app.models.question_evaluation import QuestionEvaluation
from app.models.test_evaluation import TestEvaluation
from app.models.coding_question import CodingQuestion

router = APIRouter(
    prefix="/coding/tests",
    tags=["Question Insights"]
)

@router.get("/{test_id}/question-insights")
def question_insights(test_id: str, db: Session = Depends(get_db)):
    rows = (
        db.query(QuestionEvaluation, CodingQuestion)
        .join(
            TestEvaluation,
            TestEvaluation.id == QuestionEvaluation.evaluation_id
        )
        .join(
            CodingQuestion,
            CodingQuestion.id == QuestionEvaluation.question_id
        )
        .filter(TestEvaluation.test_id == test_id)
        .all()
    )

    return [
        {
            "title": question.title,
            "description": question.description,
            "type": evaluation.question_type,
            "difficulty": evaluation.difficulty,
            "attempted": evaluation.attempted,
            "correct": evaluation.obtained_score > 0
        }
        for evaluation, question in rows
    ]
