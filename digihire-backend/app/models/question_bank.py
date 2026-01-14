#app/models/question_bank.py
import uuid
from sqlalchemy import Column, String, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.database import Base

class QuestionBank(Base):
    __tablename__ = "question_banks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(150), nullable=False)
    skill = Column(String(100), nullable=True)
    question_type = Column(String(20), nullable=False)  # Coding / MCQ
    status = Column(String(20), default="Active")

    created_at = Column(
        TIMESTAMP(timezone=True),
        server_default=func.now()
    )
