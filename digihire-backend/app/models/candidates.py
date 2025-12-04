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


class Candidate(Base):
    __tablename__ = "candidates"

    candidate_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    phone_number = Column(String(50), nullable=True)
    company_id = Column(String(10), ForeignKey("companies.company_id", ondelete="SET NULL"), nullable=True)
    resume_path = Column(String(2048), nullable=True)
    last_score = Column(String(50), nullable=True)  # UI-friendly percent string, e.g. "92.40%"
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)

    company = relationship("Company", back_populates="candidates")

    # relationship to assessment candidates (many-to-many via AssessmentCandidate)
    assessments = relationship(
        "AssessmentCandidate",
        back_populates="candidate",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
