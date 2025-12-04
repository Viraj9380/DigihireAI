#app/crud/candidate.py
from sqlalchemy.orm import Session
from app.models.candidates import Candidate
from ..schemas.candidate import CandidateCreate
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from uuid import UUID 
from app.utils.utils import compare_scores 
def get_candidates(db: Session):
    return db.query(Candidate).all()

def create_candidate(db: Session, candidate: CandidateCreate):
    db_candidate = Candidate(
        name=candidate.name,
        email=candidate.email,
        phone_number=candidate.phone_number,
    )
    db.add(db_candidate)
    db.commit()
    db.refresh(db_candidate)
    return db_candidate

def delete_candidate(db: Session, candidate_id: str):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if candidate:
        db.delete(candidate)
        db.commit()
    return candidate


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

