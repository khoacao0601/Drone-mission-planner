# Copyright (c) 2026 Khoa Cao. All rights reserved.

from mangum import Mangum
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.v1.auth import router as auth_router
from api.v1.mission import router as mission_router
from core.config import settings
from core.database import Base, engine

# Start App
app = FastAPI(title=settings.PROJECT_NAME)

# Config CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add Router Auth to system
app.include_router(auth_router, prefix="/api/v1")
app.include_router(mission_router, prefix="/api/v1")

@app.get("/")
def health_check():
    return {"message": "Flyby Drone Mission Planner API is running!"}

# Adapter for AWS Lambda
handler = Mangum(app)