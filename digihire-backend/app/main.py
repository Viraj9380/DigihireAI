from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import Base, engine
from app.routers import candidate, vendor, assessment

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

@app.get("/")
def root():
    return {"message": "DigiHire API Running"}
