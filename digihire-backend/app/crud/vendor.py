#app/crud/vendor.py
from sqlalchemy.orm import Session
from uuid import uuid4
from app import schemas    # ✅ ADD THIS
from app.schemas.vendor import VendorCreate
from app.models.vendor import Vendor

def get_vendors(db: Session):
    return db.query(Vendor).all()


def create_vendor(db: Session, vendor: schemas.vendor.VendorCreate):
    db_vendor = Vendor(
        id=str(uuid4()),
        name=vendor.name,
        email=vendor.email
    )
    db.add(db_vendor)
    db.commit()
    db.refresh(db_vendor)
    return db_vendor
