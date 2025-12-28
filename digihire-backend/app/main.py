#app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import Base, engine
from app.routers import candidate, vendor, assessment
from app.routers import judge0
from app.routers import coding_questions
from app.routers import coding_execute, coding_tests
from app.routers import test_env


Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ROUTERS
app.include_router(candidate.router)
app.include_router(vendor.router)
app.include_router(assessment.router)
app.include_router(judge0.router)
app.include_router(coding_questions.router)
app.include_router(coding_execute.router)
app.include_router(coding_tests.router)
app.include_router(test_env.router)

@app.get("/")
def root():
    return {"message": "DigiHire API Running"}
