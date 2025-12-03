# app/routers/vendor.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.schemas.schemas2 import EditAssignVendorSchema
from app.models.models import AssessmentVendor
from app.database import get_db
from app.schemas.schemas import VendorOut
from app.schemas.vendor_assignment import VendorAssignmentOut, VendorAssignmentCreate
from app.crud.crud import (
    list_vendors,
    assign_vendor_to_assessment as crud_assign_vendor,
    get_vendor,
    get_assigned_vendors,
)

router = APIRouter(prefix="/vendor", tags=["Vendor"])


# ---------------------------
# LIST VENDORS
# ---------------------------
@router.get("/list", response_model=List[VendorOut])
def get_vendors(db: Session = Depends(get_db)):
    return list_vendors(db)


# ---------------------------
# ASSIGN VENDOR TO ASSESSMENT
# ---------------------------
@router.post("/assign", response_model=VendorAssignmentOut, response_model_exclude_none=True)
def assign_vendor(payload: VendorAssignmentCreate, db: Session = Depends(get_db)):

    created = crud_assign_vendor(
        db=db,
        assessment_id=payload.assessment_id,
        vendor_id=payload.vendor_id,
        max_candidates=payload.max_candidates
    )

    vendor = get_vendor(db, payload.vendor_id)

    return VendorAssignmentOut(
        id=created.id,
        assessment_id=str(created.assessment_id),
        vendor_id=vendor.id,
        vendor_name=vendor.vendor_name,
        vendor_email=vendor.email,
        max_candidates=created.max_candidates,
        assigned_at=getattr(created, "assigned_at", None)
    )


# ---------------------------
# GET ASSIGNED VENDORS
# ---------------------------
@router.get(
    "/assigned/{assessment_id}",
    response_model=List[VendorAssignmentOut],
    response_model_exclude_none=True
)
def list_assigned_vendors(assessment_id: UUID, db: Session = Depends(get_db)):

    rows = get_assigned_vendors(db, assessment_id)

    result = []
    for row in rows:
        vendor = get_vendor(db, row.vendor_id)
        result.append(
            VendorAssignmentOut(
                id=row.id,
                assessment_id=str(row.assessment_id),
                vendor_id=vendor.id,
                vendor_name=vendor.vendor_name,
                vendor_email=vendor.email,
                max_candidates=row.max_candidates,
                assigned_at=row.assigned_at if hasattr(row, "assigned_at") else None
            )
        )

    return result



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
