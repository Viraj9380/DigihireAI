# app/models/test_evaluation.py
import uuid
from sqlalchemy import Column, Integer, Float, String, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.db.database import Base

class TestEvaluation(Base):
    __tablename__ = "test_evaluations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    test_id = Column(UUID(as_uuid=True), ForeignKey("coding_tests.id"))
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"))

    total_score = Column(Integer)
    max_score = Column(Integer)
    percentage = Column(Float)

    level = Column(String)  # Beginner / Intermediate / Experienced / Proficient
    time_taken_sec = Column(Integer)

    section_analysis = Column(JSONB)
    skill_analysis = Column(JSONB)
    difficulty_analysis = Column(JSONB)
    proctoring_analysis = Column(JSONB)
    test_log = Column(JSONB)

    status = Column(String, default="Evaluated")

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
