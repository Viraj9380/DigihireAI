#app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import Base, engine
from app.routers import candidate, vendor, assessment
from app.routers import judge0
from app.routers import coding_questions
from app.routers import coding_execute, coding_tests
from app.routers import test_env
from app.routers import invite, student, question_banks
from app.routers import reports
from app.routers import test_reports, test_analytics, question_insights
from app.routers import analytics_analysis


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
app.include_router(invite.router)
app.include_router(student.router)
app.include_router(question_banks.router)
app.include_router(reports.router)
app.include_router(test_reports.router)
app.include_router(test_analytics.router)
app.include_router(question_insights.router)
app.include_router(analytics_analysis.router)


@app.get("/")
def root():
    return {"message": "DigiHire API Running"}
