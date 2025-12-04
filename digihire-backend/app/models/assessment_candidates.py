# app/models/models.py
import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    Float,
    CheckConstraint,
)
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base

def utcnow():
    # Use lambda when assigning as default to avoid being evaluated at import time.
    return datetime.now(timezone.utc)


class AssessmentCandidate(Base):
    __tablename__ = "assessment_candidates"

    assessment_candidate_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("assessments.assessment_id", ondelete="CASCADE"), nullable=False)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidates.candidate_id", ondelete="CASCADE"), nullable=False)

    status = Column(String(50), nullable=False, default="invited")
    score = Column(Float, nullable=True)  # numeric score (e.g., 92.40)
    submitted_at = Column(TIMESTAMP(timezone=True), nullable=True)
    is_feedback = Column(Text, nullable=True)
    invited_date = Column(TIMESTAMP(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    session_jti = Column(String(255), nullable=True)
    invite_token = Column(String(255), unique=True, nullable=True)
    invite_expiry = Column(TIMESTAMP(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc) + datetime.timedelta(days=10))

    assessment = relationship("Assessment", back_populates="candidates")
    candidate = relationship("Candidate", back_populates="assessments")
