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

from app.database import Base

def utcnow():
    # Use lambda when assigning as default to avoid being evaluated at import time.
    return datetime.now(timezone.utc)

class Company(Base):
    __tablename__ = "companies"

    company_id = Column(String(10), primary_key=True, nullable=False)
    name = Column(String(255), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)

    # relationships
    users = relationship("User", back_populates="company", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="company", cascade="all, delete-orphan")
    candidates = relationship("Candidate", back_populates="company", cascade="all, delete-orphan")

class User(Base):
    __tablename__ = "users"

    user_id = Column(String(50), primary_key=True, unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String, nullable=True)
    full_name = Column(String, nullable=True)
    role = Column(String(50), nullable=False, default="vendor")
    status = Column(String(50), nullable=False, default="active")
    company_id = Column(String(10), ForeignKey("companies.company_id", ondelete="SET NULL"), nullable=True)
    invite_token_jti = Column(String, unique=True, nullable=True)
    is_password_set = Column(Integer, nullable=False, default=1)  # 1 True, 0 False
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP(timezone=True), onupdate=func.now(), nullable=True)

    company = relationship("Company", back_populates="users")
    assessments = relationship("Assessment", back_populates="user")

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



class AssessmentVendor(Base):
    __tablename__ = "assessment_vendor"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("assessments.assessment_id", ondelete="CASCADE"), nullable=False)
    vendor_id = Column(Integer, ForeignKey("vendors.id", ondelete="CASCADE"), nullable=False)
    max_candidates = Column(Integer, nullable=False, default=0)
    assigned_at = Column(DateTime, default=datetime.utcnow) 
    assessment = relationship("Assessment", back_populates="vendor_assignments")
    vendor = relationship("Vendor", back_populates="assignments")
