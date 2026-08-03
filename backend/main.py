from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.init_db import init_db
from app.api.satellite_api import router as satellite_router
from app.api.telemetry_api import router as telemetry_router
from app.api.mission_api import router as mission_router
from app.api.ground_station_api import router as ground_station_router
from app.api.ai_api import router as ai_router
from app.api.dashboard_api import router as dashboard_router
from app.api.command_api import router as command_router
from app.api.ground_station_schedule_api import router as ground_station_schedule_router
from app.api.visibility_api import router as visibility_router
from app.api.auth_api import router as auth_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(satellite_router)
app.include_router(telemetry_router)
app.include_router(mission_router)
app.include_router(ground_station_router)
app.include_router(ai_router)
app.include_router(dashboard_router)
app.include_router(command_router)
app.include_router(ground_station_schedule_router)
app.include_router(visibility_router) 
app.include_router(auth_router)


@app.on_event("startup")
def startup():
    init_db()


@app.get("/")
def root():
    return {
        "message": "Welcome to Enterprise Space Mission Operations Platform",
        "status": "Backend is running successfully",
    }

