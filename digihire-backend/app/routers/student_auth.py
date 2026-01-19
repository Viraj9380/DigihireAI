# app/routers/student_auth.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import jwt
import os
from app.db.database import get_db
from app.models.student_access_token import StudentAccessToken
from app.models.student import Student

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "digihire-test-secret")
JWT_ALGORITHM = "HS256"

router = APIRouter(prefix="/auth", tags=["Candidate Auth"])


@router.post("/verify")
def verify_access_token(
    token: str = Query(...),
    email: str = Query(...),
    full_name: str | None = Query(None),
    db: Session = Depends(get_db),
):
    email = email.lower().strip()

    record = (
        db.query(StudentAccessToken)
        .filter(StudentAccessToken.token == token)
        .first()
    )

    if not record:
        raise HTTPException(status_code=401, detail="Invalid token")

    now = datetime.now(timezone.utc)

    if record.access_start and now < record.access_start:
        raise HTTPException(status_code=403, detail="Test not started yet")

    if record.access_end and now > record.access_end:
        raise HTTPException(status_code=403, detail="Test access expired")

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    if payload.get("email") != email:
        raise HTTPException(status_code=401, detail="Email does not match invite")

    student = (
        db.query(Student)
        .filter(Student.id == record.student_id)
        .first()
    )

    if not student:
        raise HTTPException(status_code=401, detail="Student not found")

    if full_name and not student.full_name:
        student.full_name = full_name

    if record.status == "INVITED":
        record.status = "PENDING"

    db.commit()

    return {
        "student_id": student.id,
        "test_id": record.test_id,
        "email": student.email,
        "full_name": student.full_name,
    }
