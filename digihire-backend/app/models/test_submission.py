# app/models/test_submission.py
import uuid
from sqlalchemy import Column, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.db.database import Base

class TestSubmission(Base):
    __tablename__ = "test_submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    test_id = Column(UUID(as_uuid=True), ForeignKey("coding_tests.id"))
    student_id = Column(UUID(as_uuid=True))
    answers = Column(JSONB)  # { questionId: code }
    submitted_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    proctoring_snapshots = Column(JSONB)
