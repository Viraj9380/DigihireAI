#app/models/vendor_assessment.py
from sqlalchemy import Column, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.database import Base
import uuid
from sqlalchemy import Integer
class VendorAssessment(Base):
    __tablename__ = "vendor_assessments"

    assignment_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("assessments.assessment_id"))
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
