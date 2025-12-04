from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class VendorBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None


class VendorCreate(VendorBase):
    pass


class VendorOut(BaseModel):
    id: int
    vendor_name: str  # must match SQLAlchemy attribute
    email: str

    model_config = {
        "from_attributes": True  # V2 replacement for orm_mode
    }

class AssignVendor(BaseModel):
    candidate_id: UUID
    vendor_id: UUID

class AssessmentVendorOut(BaseModel):
    assignment_id: UUID
    assessment_id: UUID
    vendor_id: UUID
    assigned_at: datetime

    class Config:
        from_attributes = True



class VendorAssignmentOut(BaseModel):
    id: int
    assessment_id: str
    vendor_id: int
    status: str
    max_candidates: int
    assigned_at: datetime | None = None  # ✅ must be optional

    class Config:
        orm_mode = True
