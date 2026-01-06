# app/models/question_evaluation.py
import uuid
from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.db.database import Base
class QuestionEvaluation(Base):
    __tablename__ = "question_evaluations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    evaluation_id = Column(UUID(as_uuid=True), ForeignKey("test_evaluations.id"))
    question_id = Column(UUID(as_uuid=True))

    question_type = Column(String)  # CODING / MCQ
    difficulty = Column(String)
    skill = Column(String)

    max_score = Column(Integer)
    obtained_score = Column(Integer)

    attempted = Column(Boolean)
    correct = Column(Boolean)

    time_taken_sec = Column(Integer)

    testcase_summary = Column(JSONB)
