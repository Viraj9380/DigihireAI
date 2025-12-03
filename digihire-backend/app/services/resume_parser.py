# app/services/resume_parser.py
import os
import tempfile
import uuid
import asyncio
from typing import Tuple
from fastapi import UploadFile
from app.crud.crud import save_resume_url_for_candidate
from sqlalchemy.orm import Session
import random
import datetime

# Try to import firebase admin when available
try:
    import firebase_admin
    from firebase_admin import credentials, storage
    FIREBASE_AVAILABLE = True
except Exception:
    FIREBASE_AVAILABLE = False

FIREBASE_BUCKET = os.getenv("FIREBASE_STORAGEBUCKET") or os.getenv("FIREBASE_STORAGE_BUCKET") or os.getenv("FIREBASE_STORAGE")

# initialize firebase admin if possible and service account provided
def maybe_init_firebase():
    if not FIREBASE_AVAILABLE:
        return
    sa_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON") or os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if not sa_path:
        return
    if not firebase_admin._apps:
        cred = credentials.Certificate(sa_path)
        firebase_admin.initialize_app(cred, {"storageBucket": FIREBASE_BUCKET})

async def save_to_local_and_return_path(file: UploadFile) -> str:
    os.makedirs("uploads", exist_ok=True)
    filename = f"{uuid.uuid4()}_{file.filename}"
    path = os.path.join("uploads", filename)
    with open(path, "wb") as f:
        content = await file.read()
        f.write(content)
    # return a local path URL-like
    return path

def upload_file_to_firebase_localpath(local_path: str, dest_name: str) -> str:
    """
    Upload using firebase_admin.storage if available. Returns public URL if possible,
    otherwise returns storage path string.
    """
    if not FIREBASE_AVAILABLE:
        return local_path
    if not firebase_admin._apps:
        # firebase not initialized - nothing we can do
        return local_path
    bucket = storage.bucket()
    blob = bucket.blob(dest_name)
    blob.upload_from_filename(local_path)
    # make publicly readable (optional)
    try:
        blob.make_public()
        return blob.public_url
    except Exception:
        return f"gs://{bucket.name}/{dest_name}"

async def save_resume_and_extract_score(db: Session, candidate_id, file: UploadFile):
    """
    Saves file locally, uploads to Firebase if configured, computes a placeholder score,
    and updates the candidate row in DB with resume_path and last_score.
    """
    maybe_init_firebase()

    # 1) Save locally
    # read file to temp location
    tmp_name = f"{uuid.uuid4()}_{file.filename}"
    os.makedirs("tmp_uploads", exist_ok=True)
    tmp_path = os.path.join("tmp_uploads", tmp_name)
    with open(tmp_path, "wb") as f:
        content = await file.read()
        f.write(content)

    resume_url = tmp_path

    # 2) Upload to firebase if available
    if FIREBASE_AVAILABLE and (firebase_admin._apps):
        dest = f"resumes/{tmp_name}"
        try:
            resume_url = upload_file_to_firebase_localpath(tmp_path, dest)
        except Exception:
            # fallback to local path
            resume_url = tmp_path

    # 3) compute score (placeholder)
    # You should replace this with your resume parsing logic
    score_num = round(random.uniform(50.0, 95.0), 2)
    score_str = f"{score_num:.2f}%"

    # 4) save to DB (updates candidate)
    updated = save_resume_url_for_candidate(db, candidate_id, resume_url, score_str)

    # remove tmp file optionally
    try:
        os.remove(tmp_path)
    except Exception:
        pass

    return updated
