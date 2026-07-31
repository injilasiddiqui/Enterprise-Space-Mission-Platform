from typing import Literal

from pydantic import BaseModel, Field


class TelemetryCreate(BaseModel):
    satellite_name: str = Field(
        ...,
        min_length=3,
        max_length=50,
        example="SAT-001"
    )

    battery: float = Field(
        ...,
        ge=0,
        le=100,
        description="Battery percentage",
        example=87.5
    )

    temperature: float = Field(
        ...,
        ge=-50,
        le=150,
        description="Satellite temperature in Celsius",
        example=42.3
    )

    solar_panel: float = Field(
        ...,
        ge=0,
        le=100,
        description="Solar panel efficiency (%)",
        example=91.8
    )

    communication: Literal[
        "Excellent",
        "Good",
        "Weak",
        "Lost"
    ] = Field(
        ...,
        example="Good"
    )

    status: Literal[
        "Healthy",
        "Warning",
        "Critical"
    ] = Field(
        ...,
        example="Healthy"
    )


class TelemetryResponse(TelemetryCreate):
    id: int

    class Config:
        from_attributes = True