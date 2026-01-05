#app/models/student.py
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP
import uuid
from app.db.database import Base
class Student(Base):
    __tablename__ = "students"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String)
    email = Column(String)
    test_id = Column(UUID)
    access_start = Column(TIMESTAMP(timezone=True))
    access_end = Column(TIMESTAMP(timezone=True))
