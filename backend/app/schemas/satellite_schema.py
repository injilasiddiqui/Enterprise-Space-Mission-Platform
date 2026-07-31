from typing import Literal
from pydantic import BaseModel, Field


class SatelliteCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=50, example="SAT-001")

    orbit: Literal[
        "LEO",
        "MEO",
        "GEO",
        "Polar",
        "Sun-Synchronous"
    ]

    mission: Literal[
        "Earth Observation",
        "Communication",
        "Navigation",
        "Weather Monitoring",
        "Scientific Research"
    ]

    health: int = Field(
        ...,
        ge=0,
        le=100,
        description="Satellite Health Percentage"
    )

    status: Literal[
        "Active",
        "Maintenance",
        "Critical",
        "Offline"
    ]


class SatelliteUpdate(SatelliteCreate):
    pass


class SatelliteResponse(SatelliteCreate):
    id: int

    class Config:
        from_attributes = True