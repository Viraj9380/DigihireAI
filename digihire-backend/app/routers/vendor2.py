# app/routers/vendor2.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.database import get_db
from app.schemas.schemas2 import (
    VendorOut2,
    AssignVendorSchema,
    EditAssignVendorSchema,
)
from app.models.models import AssessmentVendor, Assessment
from app.models.vendor import Vendor
from app.crud.crud2 import list_vendors2, get_assigned_vendors2
from typing import List

router = APIRouter(prefix="/vendor2", tags=["Vendor Assignments"])


# ---------------------------------------------------------
# GET - List vendors with assigned assessments (table view)
# ---------------------------------------------------------
@router.get("/list", response_model=list[VendorOut2])
def list_vendors(db: Session = Depends(get_db)):
    return list_vendors2(db)


# ---------------------------------------------------------
# GET - All vendors assigned to a specific assessment
# ---------------------------------------------------------
@router.get("/assigned/{assessment_id}")
def list_assigned(assessment_id: UUID, db: Session = Depends(get_db)):
    return get_assigned_vendors2(db, assessment_id)

@router.get("/assigned", response_model=List[VendorOut2])
def get_all_assigned_vendors(db: Session = Depends(get_db)):
    query = db.query(
        AssessmentVendor.id,
        AssessmentVendor.assessment_id,
        AssessmentVendor.vendor_id,
        
        Assessment.job_role,
        Vendor.vendor_name,
        

    ).join(
        Assessment, AssessmentVendor.assessment_id == Assessment.id
    ).join(
        Vendor, AssessmentVendor.vendor_id == Vendor.id
    ).all()

    return query

# ---------------------------------------------------------
# POST - Assign vendor to assessment
# ---------------------------------------------------------
@router.post("/assign")
def assign_vendor(data: AssignVendorSchema, db: Session = Depends(get_db)):

    # Check assessment
    assessment = db.query(Assessment).filter(
        Assessment.assessment_id == data.assessment_id
    ).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    # Check vendor
    vendor = db.query(Vendor).filter(Vendor.id == data.vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    # Prevent duplicate assignment
    exists = db.query(AssessmentVendor).filter(
        AssessmentVendor.assessment_id == data.assessment_id,
        AssessmentVendor.vendor_id == data.vendor_id
    ).first()

    if exists:
        raise HTTPException(
            status_code=400,
            detail="Vendor already assigned to this assessment"
        )

    # Create assignment
    assignment = AssessmentVendor(
        assessment_id=data.assessment_id,
        vendor_id=data.vendor_id,
        max_candidates=data.max_candidates
    )

    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    return {"message": "Vendor assigned successfully"}


# ---------------------------------------------------------
# PUT - Edit vendor assignment
# ---------------------------------------------------------
@router.put("/edit")
def edit_assignment(data: EditAssignVendorSchema, db: Session = Depends(get_db)):

    assignment = db.query(AssessmentVendor).filter(
        AssessmentVendor.assessment_id == data.assessment_id,
        AssessmentVendor.vendor_id == data.vendor_id
    ).first()

    if not assignment:
        raise HTTPException(
            status_code=404,
            detail="Assignment not found"
        )

    assignment.max_candidates = data.max_candidates

    db.commit()
    db.refresh(assignment)

    return {"message": "Assignment updated successfully"}


# ---------------------------------------------------------
# DELETE - Remove vendor from assessment
# ---------------------------------------------------------
@router.delete("/delete/{assessment_id}/{vendor_id}")
def delete_assignment(assessment_id: UUID, vendor_id: int, db: Session = Depends(get_db)):

    assignment = db.query(AssessmentVendor).filter(
        AssessmentVendor.assessment_id == assessment_id,
        AssessmentVendor.vendor_id == vendor_id
    ).first()

    if not assignment:
        raise HTTPException(
            status_code=404,
            detail="Assignment not found"
        )

    db.delete(assignment)
    db.commit()

    return {"message": "Assignment removed successfully"}
