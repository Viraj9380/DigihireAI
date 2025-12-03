#app/crud/candidate.py
from sqlalchemy.orm import Session
from app.models.models import Candidate
from ..schemas.candidate import CandidateCreate

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
