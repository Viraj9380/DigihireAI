# app/models/student_access_token.py
import uuid
from sqlalchemy import Column, String, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.database import Base


class StudentAccessToken(Base):
    __tablename__ = "student_access_tokens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    student_id = Column(UUID, nullable=False)
    test_id = Column(UUID, nullable=False)

    token = Column(String, nullable=False, unique=True)

    status = Column(
        String,
        nullable=False,
        default="INVITED"  # INVITED | PENDING | COMPLETED
    )

    access_start = Column(TIMESTAMP(timezone=True))
    access_end = Column(TIMESTAMP(timezone=True))

    created_at = Column(
        TIMESTAMP(timezone=True),
        server_default=func.now()
    )
