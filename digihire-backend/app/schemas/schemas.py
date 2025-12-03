# app/schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from uuid import UUID

# Candidates
class CandidateCreate(BaseModel):
    name: str
    email: EmailStr
    phone_number: Optional[str] = None

class CandidateOut(BaseModel):
    candidate_id: UUID
    name: str
    email: EmailStr
    phone_number: Optional[str] = None
    resume_path: Optional[str] = None
    last_score: Optional[str] = None
    created_at: Optional[datetime] = None
    class Config:
        orm_mode = True

class CandidateBase(BaseModel):
    candidate_id: UUID  # or int, depending on your DB
    name: str
    email: str
    phone_number: str | None = None
    resume_path: str | None = None
    last_score: str | None = None

    class Config:
        orm_mode = True

class CandidateResponse(CandidateBase):
    candidate_id: UUID 
    resume_path: Optional[str] = None
    last_score: Optional[str] = None

    class Config:
        from_attributes = True

# Assessments
class AssessmentCreate(BaseModel):
    job_role: str
    job_description: Optional[str] = None
    duration: int = 30
    work_experience: Optional[str] = None

class AssessmentOut(BaseModel):
    assessment_id: UUID
    job_role: str
    job_description: Optional[str]
    duration: int
    status: str
    created_at: Optional[datetime] = None
    class Config:
        orm_mode = True

# Vendor
class VendorResponse(BaseModel):
    id: int
    vendor_name: str
    company_name: Optional[str] = None
    class Config:
        orm_mode = True


# Assignment
class AssignVendor(BaseModel):
    assessment_id: UUID
    vendor_id: int
    max_candidates: int


class VendorOut(BaseModel):
    id: int
    vendor_name: str  # must match SQLAlchemy attribute
    email: str

    model_config = {
        "from_attributes": True  # V2 replacement for orm_mode
    }


