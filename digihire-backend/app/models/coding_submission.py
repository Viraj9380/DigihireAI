# app/models/coding_submission.py
import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.db.database import Base

class CodingSubmission(Base):
    __tablename__ = "coding_submissions" 

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    coding_question_id = Column(
        UUID(as_uuid=True),
        ForeignKey("coding_questions.id", ondelete="CASCADE"),
        nullable=False
    )

    language_id = Column(String, nullable=False)
    code = Column(String, nullable=False)

    results = Column(JSONB, nullable=False)
    status = Column(String, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
