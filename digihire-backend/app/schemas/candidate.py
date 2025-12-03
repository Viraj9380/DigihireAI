#schemas/candidate.py
from pydantic import BaseModel
from typing import Optional
import uuid

class CandidateBase(BaseModel):
    name: str
    email: str
    phone_number: str

class CandidateCreate(CandidateBase):
    pass

class CandidateOut(CandidateBase):
    candidate_id: uuid.UUID
    resume_path: Optional[str] = None
    last_score: Optional[str] = None

    class Config:
        orm_mode = True
