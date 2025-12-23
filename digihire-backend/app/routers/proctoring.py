from fastapi import APIRouter

router = APIRouter(prefix="/proctoring", tags=["Proctoring"])

@router.post("/event")
def log_event(payload: dict):
    # store in DB / logs
    return {"logged": True}
