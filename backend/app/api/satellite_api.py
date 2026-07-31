from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.satellite import Satellite
from app.schemas.satellite_schema import SatelliteCreate, SatelliteUpdate

router = APIRouter()


@router.post("/satellites")
def create_satellite(
    satellite: SatelliteCreate,
    db: Session = Depends(get_db)
):
    new_satellite = Satellite(
        name=satellite.name,
        orbit=satellite.orbit,
        mission=satellite.mission,
        health=satellite.health,
        status=satellite.status,
    )

    db.add(new_satellite)
    db.commit()
    db.refresh(new_satellite)

    return new_satellite


@router.get("/satellites")
def get_all_satellites(db: Session = Depends(get_db)):
    satellites = db.query(Satellite).all()
    return satellites


@router.put("/satellites/{satellite_id}")
def update_satellite(
    satellite_id: int,
    satellite: SatelliteUpdate,
    db: Session = Depends(get_db)
):
    existing_satellite = (
        db.query(Satellite)
        .filter(Satellite.id == satellite_id)
        .first()
    )

    if not existing_satellite:
        return {"message": "Satellite not found"}

    existing_satellite.name = satellite.name
    existing_satellite.orbit = satellite.orbit
    existing_satellite.mission = satellite.mission
    existing_satellite.health = satellite.health
    existing_satellite.status = satellite.status

    db.commit()
    db.refresh(existing_satellite)

    return existing_satellite


@router.delete("/satellites/{satellite_id}")
def delete_satellite(
    satellite_id: int,
    db: Session = Depends(get_db)
):
    satellite = (
        db.query(Satellite)
        .filter(Satellite.id == satellite_id)
        .first()
    )

    if not satellite:
        return {"message": "Satellite not found"}

    db.delete(satellite)
    db.commit()
@router.get("/satellites/performance")
def fleet_performance(
    db: Session = Depends(get_db)
):
    """
    Fleet Performance Report
    """

    total_satellites = db.query(Satellite).count()

    active_satellites = (
        db.query(Satellite)
        .filter(Satellite.status == "Active")
        .count()
    )

    maintenance_satellites = (
        db.query(Satellite)
        .filter(Satellite.status == "Maintenance")
        .count()
    )

    critical_satellites = (
        db.query(Satellite)
        .filter(Satellite.status == "Critical")
        .count()
    )

    satellites = db.query(Satellite).all()

    if satellites:
        average_health = round(
            sum(s.health for s in satellites) / len(satellites),
            2
        )
    else:
        average_health = 0

    return {
        "fleet_size": total_satellites,
        "active_satellites": active_satellites,
        "maintenance_satellites": maintenance_satellites,
        "critical_satellites": critical_satellites,
        "average_health": average_health,
        "fleet_status": "Operational"
    }
    return {"message": "Satellite deleted successfully"}