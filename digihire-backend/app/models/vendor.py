#app/models/vendor.py
from sqlalchemy import (
    Column,
    String,
    Integer,
)
from sqlalchemy.orm import relationship
from app.database import Base

class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
    vendor_name = Column(String(255), nullable=False)
    company_name = Column(String(255), nullable=True)
    vendor_mobile = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    vendor_type = Column(String(100), nullable=True)
    vendor_code = Column(String(100), unique=True, nullable=True)
    gst_number = Column(String(50), nullable=True)
    website = Column(String(255), nullable=True)
    password = Column(String(255), nullable=True)

    # assignments relationship
    assignments = relationship("AssessmentVendor", back_populates="vendor", cascade="all, delete-orphan")
