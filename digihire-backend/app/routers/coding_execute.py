from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.database import get_db
from app.models.coding_question import CodingQuestion
from app.models.coding_submission import CodingSubmission
from app.services.judge0 import create_submission, get_result

router = APIRouter(prefix="/coding/execute", tags=["Coding Execution"])

@router.post("/run")
def run_code(payload: dict, db: Session = Depends(get_db)):
    question = db.query(CodingQuestion).filter(
        CodingQuestion.id == payload["question_id"]
    ).first()

    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    code = payload["code"]
    language_id = payload["language_id"]
    custom_input = payload.get("custom_input", "")

    # ===============================
    # 1️⃣ RUN WITH CUSTOM INPUT
    # ===============================
    final_stdout = ""
    final_stderr = ""

    if custom_input.strip() != "":
        token = create_submission(
            source_code=code,
            language_id=language_id,
            stdin=custom_input
        )

        res = get_result(token)
        final_stdout = (res.get("stdout") or "").strip()
        final_stderr = (res.get("stderr") or "").strip()

    # ===============================
    # 2️⃣ RUN AGAINST TESTCASES
    # ===============================
    results = []
    passed_all = True

    for idx, tc in enumerate(question.test_cases):
        token = create_submission(
            source_code=code,
            language_id=language_id,
            stdin=tc["input"]
        )

        res = get_result(token)
        actual = (res.get("stdout") or "").strip()
        expected = tc["output"].strip()

        passed = actual == expected
        if not passed:
            passed_all = False

        results.append({
            "testcase": idx + 1,
            "input": tc["input"],
            "expected": expected,
            "actual": actual,
            "passed": passed
        })

    return {
        "status": "Run Completed",
        "passed_all": passed_all,
        "stdout": final_stdout,   # ✅ CUSTOM INPUT OUTPUT
        "stderr": final_stderr,   # ✅ ERRORS IF ANY
        "results": results        # ✅ TESTCASE RESULTS
    }


@router.post("/{question_id}/submit")
def submit_code(
    question_id: UUID,
    payload: dict,
    db: Session = Depends(get_db)
):
    question = db.query(CodingQuestion).filter(
        CodingQuestion.id == question_id
    ).first()

    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    submission = CodingSubmission(
        coding_question_id=question.id,
        language_id=str(payload["language_id"]),
        code=payload["code"],
        results=[],        # empty
        status="Submitted" # NOT Passed/Failed
    )

    db.add(submission)
    db.commit()
    db.refresh(submission)

    return {
        "message": "Code submitted successfully",
        "submission_id": submission.id
    }
