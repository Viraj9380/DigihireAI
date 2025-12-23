# app/models/coding_test.py
import uuid
from sqlalchemy import Column, String, Integer, Boolean, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.db.database import Base

class CodingTest(Base):
    __tablename__ = "coding_tests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)

    job_role = Column(String(100), nullable=True)  # null for custom tests
    questions = Column(JSONB, default=list)        # list of question IDs

    duration_minutes = Column(Integer, default=30)

    invites = Column(Integer, default=0)
    reports = Column(Integer, default=0)

    status = Column(String(20), default="Draft")   # Draft / Published

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
