#app/models/mcq_question.py
import uuid
from sqlalchemy import Column, String, TIMESTAMP, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.db.database import Base


class MCQQuestion(Base):
    __tablename__ = "mcq_questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    question = Column(String, nullable=False)

    options = Column(JSONB, nullable=False)   # ["A", "B", "C", "D"]
    correct_option = Column(String, nullable=False)

    difficulty = Column(String(20), default="Medium")  # Easy / Medium / Hard
    is_system_generated = Column(Boolean, default=False)
    technology = Column(String(100), nullable=True)
    question_bank_id = Column(UUID(as_uuid=True),ForeignKey("question_banks.id"),nullable=True)


    created_at = Column(
        TIMESTAMP(timezone=True),
        server_default=func.now()
    )