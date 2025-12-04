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

class AssessmentVendor(Base):
    __tablename__ = "assessment_vendor"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("assessments.assessment_id", ondelete="CASCADE"), nullable=False)
    vendor_id = Column(Integer, ForeignKey("vendors.id", ondelete="CASCADE"), nullable=False)
    max_candidates = Column(Integer, nullable=False, default=0)
    assigned_at = Column(DateTime, default=datetime.utcnow) 
    assessment = relationship("Assessment", back_populates="vendor_assignments")
    vendor = relationship("Vendor", back_populates="assignments")
