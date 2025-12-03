from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import schemas, crud

router = APIRouter()

# ---------------------------
# GET ALL ASSESSMENTS
# ---------------------------
@router.get("/assessments/", response_model=List[schemas.AssessmentOut])
def get_assessments(db: Session = Depends(get_db)):
    return crud.assessment.list_assessments(db)


# ---------------------------
# CREATE NEW ASSESSMENT
# ---------------------------
@router.post("/assessments/", response_model=schemas.AssessmentCreate)
def create_assessment(data: schemas.AssessmentCreate, db: Session = Depends(get_db)):
    return crud.assessment.create_assessment(db, data)


# ---------------------------
# GET SINGLE ASSESSMENT BY ID
# ---------------------------
@router.get("/assessments/{assessment_id}", response_model=schemas.AssessmentOut)
def get_single_assessment(assessment_id: str, db: Session = Depends(get_db)):
    assessment = crud.assessment.get_assessment(db, assessment_id)
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
    updated = crud.assessment.update_assessment(db, assessment_id, data)
    if not updated:
        raise HTTPException(404, "Assessment not found")
    return updated


# ---------------------------
# DELETE ASSESSMENT
# ---------------------------
@router.delete("/assessments/{assessment_id}")
def delete_assessment(assessment_id: str, db: Session = Depends(get_db)):
    deleted = crud.assessment.delete_assessment(db, assessment_id)
    if not deleted:
        raise HTTPException(404, "Assessment not found")
    return {"message": "Assessment deleted successfully"}
