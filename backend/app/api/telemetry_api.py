from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.telemetry import Telemetry
from app.schemas.telemetry_schema import TelemetryCreate

router = APIRouter(
    prefix="",
    tags=["Telemetry"]
)


@router.post(
    "/telemetry",
    status_code=status.HTTP_201_CREATED,
    summary="Create Telemetry Record"
)
def create_telemetry(
    telemetry: TelemetryCreate,
    db: Session = Depends(get_db)
):
    """
    Store a new telemetry record received from a satellite.
    """

    new_telemetry = Telemetry(
        satellite_name=telemetry.satellite_name,
        battery=telemetry.battery,
        temperature=telemetry.temperature,
        solar_panel=telemetry.solar_panel,
        communication=telemetry.communication,
        status=telemetry.status
    )

    db.add(new_telemetry)
    db.commit()
    db.refresh(new_telemetry)

    return {
        "message": "Telemetry recorded successfully.",
        "data": new_telemetry
    }


@router.get(
    "/telemetry",
    summary="Get Telemetry Records"
)
def get_all_telemetry(
    satellite_name: Optional[str] = Query(
        default=None,
        description="Filter telemetry by satellite name"
    ),
    status_filter: Optional[str] = Query(
        default=None,
        alias="status",
        description="Filter by health status"
    ),
    db: Session = Depends(get_db)
):
    """
    Retrieve telemetry records.
    Supports optional filtering.
    """

    query = db.query(Telemetry)

    if satellite_name:
        query = query.filter(
            Telemetry.satellite_name == satellite_name
        )

    if status_filter:
        query = query.filter(
            Telemetry.status == status_filter
        )

    records = query.order_by(
        Telemetry.id.desc()
    ).all()

    return {
        "count": len(records),
        "data": records
    }


@router.get(
    "/telemetry/{telemetry_id}",
    summary="Get Telemetry by ID"
)
def get_telemetry_by_id(
    telemetry_id: int,
    db: Session = Depends(get_db)
):
    """
    Retrieve one telemetry record.
    """

    telemetry = (
        db.query(Telemetry)
        .filter(Telemetry.id == telemetry_id)
        .first()
    )

    if telemetry is None:
        raise HTTPException(
            status_code=404,
            detail="Telemetry record not found."
        )

    return telemetry


@router.delete(
    "/telemetry/{telemetry_id}",
    summary="Delete Telemetry Record"
)
def delete_telemetry(
    telemetry_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a telemetry record.
    """

    telemetry = (
        db.query(Telemetry)
        .filter(Telemetry.id == telemetry_id)
        .first()
    )

    if telemetry is None:
        raise HTTPException(
            status_code=404,
            detail="Telemetry record not found."
        )

    db.delete(telemetry)
    db.commit()

    return {
        "message": "Telemetry deleted successfully."
    }


@router.get(
    "/telemetry/summary",
    summary="Telemetry Summary"
)
def telemetry_summary(
    db: Session = Depends(get_db)
):
    """
    Return dashboard statistics.
    """

    total = db.query(Telemetry).count()

    healthy = db.query(Telemetry).filter(
        Telemetry.status == "Healthy"
    ).count()

    warning = db.query(Telemetry).filter(
        Telemetry.status == "Warning"
    ).count()

    critical = db.query(Telemetry).filter(
        Telemetry.status == "Critical"
    ).count()

    return {
        "total_records": total,
        "healthy": healthy,
        "warning": warning,
        "critical": critical
    }