from datetime import date
from typing import Literal

from pydantic import BaseModel, Field


class MissionCreate(BaseModel):
    mission_name: str = Field(
        ...,
        min_length=3,
        max_length=100,
        example="Earth Observation Mission"
    )

    satellite_name: str = Field(
        ...,
        min_length=3,
        max_length=50,
        example="SAT-001"
    )

    launch_date: date = Field(
        ...,
        description="Mission launch date",
        example="2026-08-15"
    )

    status: Literal[
        "Planned",
        "Active",
        "Completed",
        "Cancelled"
    ] = Field(
        ...,
        example="Planned"
    )


class MissionResponse(MissionCreate):
    id: int

    class Config:
        from_attributes = True