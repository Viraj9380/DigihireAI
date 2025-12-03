# app/routers/candidate.py
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database import get_db
from app import models, schemas
from app.crud import crud as crud_module
from app.schemas.schemas import CandidateResponse
from app.crud.crud import update_resume_and_score

router = APIRouter(prefix="/candidates", tags=["Candidates"])

@router.post("/", response_model=List[schemas.CandidateOut])
def create_multiple_candidates(
    names: List[str] = Form(...),
    emails: List[str] = Form(...),
    phone_numbers: List[str] = Form(None),
    resume_urls: List[str] = Form(None),     # 🔥 added
    db: Session = Depends(get_db),
):
    """
    Create candidates + OPTIONAL resume URLs (uploaded on frontend/Firebase).
    """
    if len(names) != len(emails):
        raise HTTPException(status_code=400, detail="names and emails length mismatch")

    # If resume_urls provided, ensure same length
    if resume_urls and len(resume_urls) != len(names):
        raise HTTPException(status_code=400, detail="resume_urls length mismatch")

    created = []
    for i in range(len(names)):
        cand = schemas.CandidateCreate(
            name=names[i],
            email=emails[i],
            phone_number=phone_numbers[i] if phone_numbers else None
        )
        created.append(cand)

    db_candidates = crud_module.create_multiple_candidates(db, created)

    # 🔥 Auto-update resume_path + last_score if URLs provided
    if resume_urls:
        for idx, cand in enumerate(db_candidates):
            if resume_urls[idx]:
                update_resume_and_score(db, cand.candidate_id, resume_urls[idx])

    return db_candidates

@router.post("/upload", response_model=CandidateResponse)
def upload_resume(candidate_id: UUID, resume_url: str, db: Session = Depends(get_db)):
    """
    Frontend uploads PDF → Firebase → sends URL here.
    """
    updated = update_resume_and_score(db, candidate_id, resume_url)

    if not updated:
        raise HTTPException(status_code=404, detail="Candidate not found")

    return updated

@router.get("/", response_model=List[schemas.CandidateOut])
def list_candidates(db: Session = Depends(get_db)):
    return crud_module.list_candidates(db)


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
    created = crud_module.create_multiple_candidates(db, [schemas.CandidateCreate(**c) for c in candidates_payload])
    return created


@router.get("/candidates/", response_model=list[schemas.CandidateOut])
def list_candidates(db: Session = Depends(get_db)):
    return db.query(models.Candidate).order_by(models.Candidate.created_at.desc()).all()


@router.delete("/{candidate_id}")
def delete_candidate(candidate_id: UUID, db: Session = Depends(get_db)):
    return crud_module.delete_candidate(db, candidate_id)


@router.post("/upload", response_model=CandidateResponse)
def upload_resume(candidate_id: UUID, resume_url: str, db: Session = Depends(get_db)):
    updated = update_resume_and_score(db, candidate_id, resume_url)
    
    if not updated:
        raise HTTPException(status_code=404, detail="Candidate not found")

    return updated