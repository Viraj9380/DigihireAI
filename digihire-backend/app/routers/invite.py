# app/routers/invite.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.database import get_db
from app.models.coding_test import CodingTest
from app.models.student import Student
from app.models.test_submission import TestSubmission
from app.models.student_access_token import StudentAccessToken
from app.utils.mailer import send_test_invite_email
from app.utils.test_access_token import generate_test_access_token

router = APIRouter(prefix="/coding/tests", tags=["Invites"])


class InvitePayload(BaseModel):
    emails: list[str]
    access_start: datetime | None = None
    access_end: datetime | None = None


def _send_invite(
    db: Session,
    test: CodingTest,
    email: str,
    access_start,
    access_end,
):
    # 🔹 Create student record
    student = Student(
        email=email,
        test_id=test.id,
        access_start=access_start,
        access_end=access_end,
    )
    db.add(student)
    db.flush()  # ensures student.id exists

    # 🔐 Generate token (FIXED ARGUMENTS)
    token = generate_test_access_token(
        test_id=test.id,
        student_id=student.id,
        email=email,
        access_start=access_start,
        access_end=access_end,
    )

    # 🔒 Persist token
    db.add(
        StudentAccessToken(
            student_id=student.id,
            test_id=test.id,
            token=token,
            access_start=access_start,
            access_end=access_end,
        )
    )

    # 📧 Send email
    send_test_invite_email(
        to_emails=[email],
        test_name=test.title,
        duration_minutes=test.duration_minutes,
        test_link=f"http://localhost:3000/auth/{test.id}?token={token}",
    )


@router.post("/{test_id}/invite")
def invite_candidates(
    test_id: str,
    payload: InvitePayload,
    db: Session = Depends(get_db),
):
    test = db.query(CodingTest).filter(CodingTest.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    for email in payload.emails:
        existing = (
            db.query(Student)
            .filter(Student.test_id == test_id, Student.email == email)
            .first()
        )

        if existing:
            raise HTTPException(
                status_code=400,
                detail="This candidate is already invited",
            )

        _send_invite(db, test, email, payload.access_start, payload.access_end)

    test.invites = (test.invites or 0) + len(payload.emails)
    db.commit()

    return {"status": "sent"}


@router.post("/{test_id}/reinvite")
def reinvite_candidate(
    test_id: str,
    payload: InvitePayload,
    db: Session = Depends(get_db),
):
    test = db.query(CodingTest).filter(CodingTest.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    for email in payload.emails:
        _send_invite(db, test, email, payload.access_start, payload.access_end)

    test.invites = (test.invites or 0) + len(payload.emails)
    db.commit()

    return {"status": "resent"}


@router.get("/{test_id}/invites")
def list_invites(test_id: str, db: Session = Depends(get_db)):
    test = db.query(CodingTest).filter(CodingTest.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    students = db.query(Student).filter(Student.test_id == test_id).all()

    submissions = db.query(TestSubmission).filter(
        TestSubmission.test_id == test_id
    ).all()

    submission_map = {s.student_id: s for s in submissions}

    result = []
    for student in students:
        submission = submission_map.get(student.id)

        result.append({
            "email": student.email,
            "submitted_at": submission.submitted_at if submission else None,
            "access_time": (
                f"{student.access_start} → {student.access_end}"
                if student.access_start
                else f"{test.duration_minutes} min"
            ),
            "proctoring": test.proctoring_mode != "NONE",
            "can_reinvite": True,
        })

    return result
