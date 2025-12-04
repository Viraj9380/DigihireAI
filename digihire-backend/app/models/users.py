# app/models/models.py

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
