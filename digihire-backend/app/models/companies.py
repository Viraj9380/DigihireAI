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

class Company(Base):
    __tablename__ = "companies"

    company_id = Column(String(10), primary_key=True, nullable=False)
    name = Column(String(255), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)

    # relationships
    users = relationship("User", back_populates="company", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="company", cascade="all, delete-orphan")
    candidates = relationship("Candidate", back_populates="company", cascade="all, delete-orphan")
