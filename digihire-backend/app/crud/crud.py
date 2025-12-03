# app/crud.py
from sqlalchemy.orm import Session
from app.models.models import Candidate
from app.models.models import Assessment
from app.models.models import AssessmentVendor
from app.models.vendor import Vendor


from app.schemas.schemas import CandidateCreate
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
import os, shutil
from uuid import UUID 
from datetime import datetime
from app.utils import compare_scores 
# ---------------------
# Candidate functions for app/crud.py
# ---------------------# app/crud.py



def create_multiple_candidates(db: Session, candidates_list: list[CandidateCreate]):
    created = []
    for c in candidates_list:
        candidate = Candidate(
            name=c.name,
            email=c.email,
            phone_number=c.phone_number
        )
        db.add(candidate)
        created.append(candidate)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="One or more candidate emails already exist")

    for cand in created:
        db.refresh(cand)

    return created



def list_candidates(db: Session):
    return db.query(Candidate).order_by(Candidate.created_at.desc()).all()

def get_candidate(db: Session, candidate_id):
    return db.query(Candidate).filter(Candidate.candidate_id == candidate_id).first()

def delete_candidate(db: Session, candidate_id):
    cand = get_candidate(db, candidate_id)
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")
    db.delete(cand)
    db.commit()
    return {"detail": "deleted"}

# Helper to update candidate after upload
def update_resume_and_score(db: Session, candidate_id: UUID, resume_url: str):
    candidate = db.query(Candidate).filter(Candidate.candidate_id == candidate_id).first()

    if not candidate:
        return None

    score = compare_scores(resume_url)   # compute score

    candidate.resume_path = resume_url
    candidate.last_score = float(score)

    db.commit()
    db.refresh(candidate)
    return candidate


# ---------------------
# Assessment functions
# ---------------------
def create_assessment(db: Session, assessment_in):
    a = Assessment(**assessment_in.dict())
    db.add(a)
    db.commit()
    db.refresh(a)
    return a

def list_assessments(db: Session):
    return db.query(Assessment).order_by(Assessment.created_at.desc()).all()

def get_assessment(db: Session, assessment_id):
    return db.query(Assessment).filter(Assessment.assessment_id == assessment_id).first()

def update_assessment(db: Session, assessment_id, payload: dict):
    a = get_assessment(db, assessment_id)
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found")
    for k, v in payload.items():
        setattr(a, k, v)
    db.commit()
    db.refresh(a)
    return a

def delete_assessment(db: Session, assessment_id):
    a = get_assessment(db, assessment_id)
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found")
    db.delete(a)
    db.commit()
    return {"detail": "deleted"}

# ---------------------
# Vendors & assignments
# ---------------------
def list_vendors(db: Session):
    return db.query(Vendor).order_by(Vendor.id.asc()).all()

def get_vendor(db: Session, vendor_id):
    return db.query(Vendor).filter(Vendor.id == vendor_id).first()

def create_vendor(db: Session, vendor_data: dict):
    v = Vendor(**vendor_data)
    db.add(v); db.commit(); db.refresh(v); return v

def assign_vendor_to_assessment(db: Session, assessment_id: UUID, vendor_id: int, max_candidates: int):
    assessment = db.query(Assessment).filter(Assessment.assessment_id == assessment_id).first()

    if not assessment:
        raise HTTPException(status_code=400, detail="Assessment not found")

    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=400, detail="Vendor not found")

    link = AssessmentVendor(
        assessment_id=assessment_id,
        vendor_id=vendor_id,
        max_candidates=max_candidates,
        assigned_at=datetime.utcnow()
    )

    db.add(link)
    db.commit()
    db.refresh(link)
    return link

def get_assigned_vendors(db: Session, assessment_id):
    return db.query(AssessmentVendor).filter(AssessmentVendor.assessment_id == assessment_id).all()


