# app/schemas/assessment.py OR app/schemas.py

from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class AssessmentBase(BaseModel):
    job_role: str
    job_description: Optional[str] = None
    duration: int
    work_experience: Optional[str] = None
    status: Optional[str] = "draft"
    max_candidates: int

class AssessmentCreate(AssessmentBase):
    pass

class AssessmentOut(AssessmentBase):
    assessment_id: UUID
    created_at: datetime

    class Config:
        orm_mode = True
