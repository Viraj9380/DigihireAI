# app/schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from uuid import UUID

class AssignedAssessment(BaseModel):
    assessment_id: UUID
    job_role: str
    max_candidates: int

class VendorOut2(BaseModel):
    id: int
    vendor_name: str
    email: str
    assigned_assessments: Optional[List[AssignedAssessment]] = []

    model_config = { "from_attributes": True }

class AssignVendorSchema(BaseModel):
    assessment_id: UUID
    vendor_id: int
    max_candidates: int


class EditAssignVendorSchema(BaseModel):
    assessment_id: UUID
    vendor_id: int
    max_candidates: int