#app/crud/vendor_assignment.py
from sqlalchemy.orm import Session
from app.models.vendor_assignment import AssessmentVendor
from app.models.vendor import Vendor

def assign_vendor(db: Session, assessment_id: str, vendor_id: int):
    assignment = AssessmentVendor(
        assessment_id=assessment_id,
        vendor_id=vendor_id
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment

def get_assigned_vendors(db: Session, assessment_id: str):
    return (
        db.query(AssessmentVendor)
        .filter(AssessmentVendor.assessment_id == assessment_id)
        .order_by(AssessmentVendor.id.asc())
        .all()
    )
