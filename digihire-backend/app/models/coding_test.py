import uuid
from sqlalchemy import Column, String, Integer, TIMESTAMP, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.db.database import Base

class CodingTest(Base):
    __tablename__ = "coding_tests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    title = Column(String, nullable=False)

    job_role = Column(String(100), nullable=True)  # null for custom tests
    proctoring_mode = Column(String, default="NONE") 

    # 🔹 NEW: Separate question tracking
    coding_question_ids = Column(JSONB, default=list)  # coding question UUIDs
    mcq_question_ids = Column(JSONB, default=list)     # mcq question UUIDs

    duration_minutes = Column(Integer, default=30)

    invites = Column(Integer, default=0)
    reports = Column(Integer, default=0)
    # ✅ NEW SETTINGS
    allow_copy_paste = Column(Boolean, default=True)
    terminate_on_violation = Column(Boolean, default=False)
    max_violations = Column(Integer, default=0)
    shuffle_questions = Column(Boolean, default=False)

    status = Column(String(20), default="Draft")  # Draft / Published
    

    created_at = Column(
        TIMESTAMP(timezone=True),
        server_default=func.now()
    )

    # 🔹 NEW: updated_at
    updated_at = Column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )