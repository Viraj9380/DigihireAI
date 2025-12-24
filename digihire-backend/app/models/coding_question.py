# app/models/coding_question.py
import uuid
from sqlalchemy import Column, String, Text, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.db.database import Base

class CodingQuestion(Base):
    __tablename__ = "coding_questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    difficulty = Column(String(20), default="Medium")
    input_format = Column(Text)
    output_format = Column(Text)
    constraints = Column(Text)

    sample_input = Column(Text)
    sample_output = Column(Text)
    examples = Column(JSONB, nullable=True)

    # ✅ FIXED NAME
    test_cases = Column(JSONB, nullable=False)

    created_at = Column(
        TIMESTAMP(timezone=True),
        server_default=func.now()
    )
