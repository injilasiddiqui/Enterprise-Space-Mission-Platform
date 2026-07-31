from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.ground_station import GroundStation
from app.schemas.ground_station_schema import GroundStationCreate

router = APIRouter(
    tags=["Ground Station Management"]
)


@router.post(
    "/ground-stations",
    status_code=status.HTTP_201_CREATED,
    summary="Register Ground Station"
)
def create_ground_station(
    station: GroundStationCreate,
    db: Session = Depends(get_db)
):
    """
    Register a new ground station.
    """

    existing = db.query(GroundStation).filter(
        GroundStation.station_name == station.station_name
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Ground station already exists."
        )

    new_station = GroundStation(
        station_name=station.station_name,
        location=station.location,
        communication_window=station.communication_window,
        status=station.status
    )

    db.add(new_station)
    db.commit()
    db.refresh(new_station)

    return {
        "message": "Ground station registered successfully.",
        "data": new_station
    }


@router.get(
    "/ground-stations",
    summary="Get Ground Stations"
)
def get_ground_stations(
    location: Optional[str] = Query(
        default=None,
        description="Filter by location"
    ),
    status_filter: Optional[str] = Query(
        default=None,
        alias="status",
        description="Filter by station status"
    ),
    db: Session = Depends(get_db)
):
    """
    Retrieve all ground stations with optional filtering.
    """

    query = db.query(GroundStation)

    if location:
        query = query.filter(
            GroundStation.location == location
        )

    if status_filter:
        query = query.filter(
            GroundStation.status == status_filter
        )

    stations = query.order_by(
        GroundStation.id.desc()
    ).all()

    return {
        "count": len(stations),
        "data": stations
    }


@router.get(
    "/ground-stations/{station_id}",
    summary="Get Ground Station by ID"
)
def get_ground_station_by_id(
    station_id: int,
    db: Session = Depends(get_db)
):
    """
    Retrieve one ground station.
    """

    station = db.query(GroundStation).filter(
        GroundStation.id == station_id
    ).first()

    if station is None:
        raise HTTPException(
            status_code=404,
            detail="Ground station not found."
        )

    return station


@router.put(
    "/ground-stations/{station_id}",
    summary="Update Ground Station"
)
def update_ground_station(
    station_id: int,
    station: GroundStationCreate,
    db: Session = Depends(get_db)
):
    """
    Update ground station information.
    """

    existing = db.query(GroundStation).filter(
        GroundStation.id == station_id
    ).first()

    if existing is None:
        raise HTTPException(
            status_code=404,
            detail="Ground station not found."
        )

    existing.station_name = station.station_name
    existing.location = station.location
    existing.communication_window = station.communication_window
    existing.status = station.status

    db.commit()
    db.refresh(existing)

    return {
        "message": "Ground station updated successfully.",
        "data": existing
    }


@router.delete(
    "/ground-stations/{station_id}",
    summary="Delete Ground Station"
)
def delete_ground_station(
    station_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a ground station.
    """

    station = db.query(GroundStation).filter(
        GroundStation.id == station_id
    ).first()

    if station is None:
        raise HTTPException(
            status_code=404,
            detail="Ground station not found."
        )

    db.delete(station)
    db.commit()

    return {
        "message": "Ground station deleted successfully."
    }


@router.get(
    "/ground-stations/summary",
    summary="Ground Station Summary"
)
def ground_station_summary(
    db: Session = Depends(get_db)
):
    """
    Return dashboard statistics.
    """

    total = db.query(GroundStation).count()

    active = db.query(GroundStation).filter(
        GroundStation.status == "Active"
    ).count()

    maintenance = db.query(GroundStation).filter(
        GroundStation.status == "Maintenance"
    ).count()

    inactive = db.query(GroundStation).filter(
        GroundStation.status == "Inactive"
    ).count()

    return {
        "total_ground_stations": total,
        "active": active,
        "maintenance": maintenance,
        "inactive": inactive
    }