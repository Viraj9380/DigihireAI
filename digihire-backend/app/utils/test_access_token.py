# app/utils/test_access_token.py
import jwt
import os
from datetime import datetime, timedelta, timezone

# ✅ MUST MATCH student_auth.py
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "digihire-test-secret")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")


def generate_test_access_token(
    test_id,
    student_id,
    email,
    access_start,
    access_end
):
    now = datetime.now(timezone.utc)

    payload = {
        "sub": "test_access",
        "test_id": str(test_id),
        "student_id": str(student_id),
        "email": email,
        "access_start": access_start.isoformat() if access_start else None,
        "access_end": access_end.isoformat() if access_end else None,
        "iat": int(now.timestamp()),
        "exp": int(
            access_end.timestamp()
            if access_end
            else (now + timedelta(days=1)).timestamp()
        ),
    }

    token = jwt.encode(
        payload,
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM
    )

    return token
