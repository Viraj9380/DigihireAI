from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.database import get_db
from app.models.test_evaluation import TestEvaluation
from app.models.student import Student
from app.models.coding_test import CodingTest
from app.models.coding_question import CodingQuestion
from app.models.mcq_question import MCQQuestion
from app.models.question_evaluation import QuestionEvaluation
from app.services.report_pdf import generate_report_pdf

router = APIRouter(
    prefix="/reports",
    tags=["PDF Reports"]
)

@router.get("/{evaluation_id}/download")
def download_report(evaluation_id: UUID, db: Session = Depends(get_db)):
    evaluation = db.query(TestEvaluation).get(evaluation_id)
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")

    student = db.query(Student).get(evaluation.student_id)
    test = db.query(CodingTest).get(evaluation.test_id)

    question_rows = (
        db.query(QuestionEvaluation)
        .filter(QuestionEvaluation.evaluation_id == evaluation.id)
        .all()
    )

    questions = []

    for q in question_rows:
        # 🔀 Resolve question based on type
        if q.question_type == "CODING":
            cq = db.query(CodingQuestion).get(q.question_id)
            title = cq.title if cq else "Coding Question"
        elif q.question_type == "MCQ":
            mq = db.query(MCQQuestion).get(q.question_id)
            title = mq.question if mq else "MCQ Question"
        else:
            title = "Question"

        questions.append({
            "title": title,
            "type": q.question_type,
            "difficulty": q.difficulty,
            "attempted": q.attempted,
            "score": q.obtained_score
        })

    pdf_path = generate_report_pdf(
        evaluation=evaluation,
        student=student,
        test=test,
        questions=questions
    )

    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename="Assessment_Report.pdf"
    )