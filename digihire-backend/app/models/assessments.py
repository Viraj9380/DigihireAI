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


class Assessment(Base):
    __tablename__ = "assessments"

    assessment_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    user_id = Column(String(50), ForeignKey("users.user_id"), nullable=True)
    company_id = Column(String(10), ForeignKey("companies.company_id", ondelete="CASCADE"), nullable=True)

    # Keeping job_role/job_description to maintain compatibility with prior code,
    # while also ensuring max_candidates field exists and has a default.
    job_role = Column(String(255), nullable=False)
    job_description = Column(Text, nullable=True)
    duration = Column(Integer, nullable=False, default=30)
    work_experience = Column(String(255), nullable=True)
    status = Column(String(50), nullable=False, default="draft")
    max_candidates = Column(Integer, nullable=False, default=0)

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP(timezone=True), onupdate=func.now(), nullable=True)

    __table_args__ = (
        CheckConstraint("status IN ('draft','published','closed')", name="status_check"),
    )

    user = relationship("User", back_populates="assessments")
    company = relationship("Company", back_populates="assessments")

    # relationship to AssessmentCandidate (candidates invited to this assessment)
    candidates = relationship(
        "AssessmentCandidate",
        back_populates="assessment",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    # relationship to vendor assignments
    vendor_assignments = relationship(
        "AssessmentVendor",
        back_populates="assessment",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
