# app/routers/candidate.py
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.db.database import get_db
from app import models, schemas
from app.schemas.candidate import CandidateResponse
from app.services.candidate import update_resume_and_score
from app.services import candidate
from app.services.candidate import list_candidates, create_multiple_candidates, delete_candidate 
router = APIRouter(prefix="/candidates", tags=["Candidates"])


@router.get("/", response_model=List[schemas.CandidateOut])
def list_candidates(db: Session = Depends(get_db)):
    return list_candidates(db)


@router.post("/", response_model=List[schemas.CandidateOut])
def create_multiple_candidates(
    names: List[str] = Form(...),
    emails: List[str] = Form(...),
    phone_numbers: List[str] = Form(None),
    db: Session = Depends(get_db),
):
    """
    Expects form arrays: names[], emails[], phone_numbers[].
    This is used by AddCandidateModal to create many rows at once.
    """
    if len(names) != len(emails):
        raise HTTPException(status_code=400, detail="names and emails length mismatch")

    candidates_payload = []
    for i, name in enumerate(names):
        candidates_payload.append(
            {"name": name, "email": emails[i], "phone_number": (phone_numbers[i] if phone_numbers else None)}
        )
    created = candidate.create_multiple_candidates(db, [schemas.CandidateCreate(**c) for c in candidates_payload])
    return created


@router.get("/candidates/", response_model=list[schemas.CandidateOut])
def list_candidates(db: Session = Depends(get_db)):
    return db.query(models.Candidate).order_by(models.Candidate.created_at.desc()).all()


@router.delete("/{candidate_id}")
def delete_candidate(candidate_id: UUID, db: Session = Depends(get_db)):
    return candidate.delete_candidate(db, candidate_id)


@router.post("/upload", response_model=CandidateResponse)
def upload_resume(candidate_id: UUID, resume_url: str, db: Session = Depends(get_db)):
    updated = update_resume_and_score(db, candidate_id, resume_url)
    
    if not updated:
        raise HTTPException(status_code=404, detail="Candidate not found")

    return updated