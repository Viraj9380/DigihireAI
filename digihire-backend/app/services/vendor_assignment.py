#app/crud/vendor_assignment.py
from sqlalchemy.orm import Session
from app.models.assessment_vendor import AssessmentVendor
from app.models.vendors import Vendor
from app.models.assessments import Assessment
from fastapi import HTTPException
from uuid import UUID 
from datetime import datetime

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





