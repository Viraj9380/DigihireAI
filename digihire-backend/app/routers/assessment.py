#app/routers/assessment.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db


from app import schemas
from app.services.assessment import list_assessments, create_assessment, get_assessment, update_assessment, delete_assessment
router = APIRouter()
 
# ---------------------------
# GET ALL ASSESSMENTS
# ---------------------------
@router.get("/assessments/", response_model=List[schemas.AssessmentOut])
def get_assessments(db: Session = Depends(get_db)):
    return list_assessments(db)


# ---------------------------
# CREATE NEW ASSESSMENT
# ---------------------------
@router.post("/assessments/", response_model=schemas.AssessmentCreate)
def create_assessment(data: schemas.AssessmentCreate, db: Session = Depends(get_db)):
    return create_assessment(db, data)


# ---------------------------
# GET SINGLE ASSESSMENT BY ID
# ---------------------------
@router.get("/assessments/{assessment_id}", response_model=schemas.AssessmentOut)
def get_single_assessment(assessment_id: str, db: Session = Depends(get_db)):
    assessment = get_assessment(db, assessment_id)
    if not assessment:
        raise HTTPException(404, "Assessment not found")
    return assessment


# ---------------------------
# UPDATE ASSESSMENT
# ---------------------------
@router.put("/assessments/{assessment_id}", response_model=schemas.AssessmentBase)
def update_assessment(
    assessment_id: str,
    data: schemas.AssessmentCreate,
    db: Session = Depends(get_db),
):
    updated = update_assessment(db, assessment_id, data)
    if not updated:
        raise HTTPException(404, "Assessment not found")
    return updated


# ---------------------------
# DELETE ASSESSMENT
# ---------------------------
@router.delete("/assessments/{assessment_id}")
def delete_assessment(assessment_id: str, db: Session = Depends(get_db)):
    deleted = delete_assessment(db, assessment_id)
    if not deleted:
        raise HTTPException(404, "Assessment not found")
    return {"message": "Assessment deleted successfully"}












