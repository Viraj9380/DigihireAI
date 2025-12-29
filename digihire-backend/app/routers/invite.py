from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.coding_test import CodingTest
from app.utils.mailer import send_test_invite_email

router = APIRouter(prefix="/coding/tests", tags=["Invites"])


class InvitePayload(BaseModel):
    emails: list[str]


@router.post("/{test_id}/invite", response_model=None)
def invite_candidates(
    test_id: str,
    payload: InvitePayload,
    db: Session = Depends(get_db),
):
    test = db.query(CodingTest).filter(CodingTest.id == test_id).first()

    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    send_test_invite_email(
        to_emails=payload.emails,
        test_name=test.title,
        duration_minutes=test.duration_minutes,
        test_link=f"http://localhost:3000/auth/{test.id}",
    )

    test.invites = (test.invites or 0) + len(payload.emails)
    db.commit()

    return {
        "status": "sent",
        "count": len(payload.emails),
    }
