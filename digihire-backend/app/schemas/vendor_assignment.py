from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
class VendorAssignmentCreate(BaseModel):
    assessment_id: UUID
    vendor_id: int
    max_candidates: int

class VendorAssignmentOut(BaseModel):
    id: int
    assessment_id: str
    vendor_id: int
    vendor_name: str
    vendor_email: str
    assigned_at: Optional[datetime] = None
    max_candidates : int
    class Config:
        orm_mode = True

class AssignVendorPayload(BaseModel):
    assessment_id: UUID
    vendor_id: int
    max_candidates: int


class EditAssignVendorSchema(BaseModel):
    assessment_id: UUID
    vendor_id: int
    max_candidates: int