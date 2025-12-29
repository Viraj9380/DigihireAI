from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.student import Student
from pydantic import BaseModel, EmailStr
from uuid import UUID

router = APIRouter(prefix="/students", tags=["Students"])


class StudentCreate(BaseModel):
    full_name: str
    email: EmailStr
    test_id: UUID

@router.post("/")
def create_student(
    student: StudentCreate,
    db: Session = Depends(get_db),
):
    new_student = Student(
        full_name=student.full_name,
        email=student.email,
        test_id=student.test_id
    )

    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    return {
        "status": "created",
        "student_id": new_student.id,
    }
