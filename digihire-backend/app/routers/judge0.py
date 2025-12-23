from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services import judge0

router = APIRouter(prefix="/judge0", tags=["Judge0"])

class RunCodePayload(BaseModel):
    source_code: str
    language_id: int
    stdin: str = ""

@router.post("/run")
def run_code(payload: RunCodePayload):
    if not payload.source_code:
        raise HTTPException(400, "Source code required")

    try:
        token = judge0.create_submission(
            payload.source_code,
            payload.language_id,
            payload.stdin
        )
        result = judge0.get_result(token)
        return result
    except Exception as e:
        raise HTTPException(500, str(e))
