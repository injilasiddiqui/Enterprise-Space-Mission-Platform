from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.satellite import Satellite
from app.models.telemetry import Telemetry
from app.models.mission import Mission
from app.models.ground_station import GroundStation


router = APIRouter(
    tags=["Dashboard"]
)


@router.get(
    "/dashboard",
    summary="Mission Operations Dashboard"
)
def dashboard_summary(
    db: Session = Depends(get_db)
):
    """
    Return live operational statistics for the enterprise dashboard.
    """

    # ---------------- Satellite Fleet ----------------

    total_satellites = db.query(Satellite).count()

    active_satellites = db.query(Satellite).filter(
        Satellite.status == "Active"
    ).count()

    maintenance_satellites = db.query(Satellite).filter(
        Satellite.status == "Maintenance"
    ).count()

    critical_satellites = db.query(Satellite).filter(
        Satellite.status == "Critical"
    ).count()

    # ---------------- Telemetry ----------------

    total_telemetry = db.query(Telemetry).count()

    healthy_telemetry = db.query(Telemetry).filter(
        Telemetry.status == "Healthy"
    ).count()

    warning_telemetry = db.query(Telemetry).filter(
        Telemetry.status == "Warning"
    ).count()

    critical_telemetry = db.query(Telemetry).filter(
        Telemetry.status == "Critical"
    ).count()

    latest_telemetry = (
        db.query(Telemetry)
        .order_by(Telemetry.id.desc())
        .first()
    )

    latest_satellite = (
        latest_telemetry.satellite_name
        if latest_telemetry
        else "No telemetry available"
    )

    # ---------------- Missions ----------------

    total_missions = db.query(Mission).count()

    planned_missions = db.query(Mission).filter(
        Mission.status == "Planned"
    ).count()

    approved_missions = db.query(Mission).filter(
        Mission.status == "Approved"
    ).count()

    active_missions = db.query(Mission).filter(
        Mission.status == "Active"
    ).count()

    completed_missions = db.query(Mission).filter(
        Mission.status == "Completed"
    ).count()

    cancelled_missions = db.query(Mission).filter(
        Mission.status == "Cancelled"
    ).count()

    # ---------------- Ground Stations ----------------

    total_ground_stations = db.query(GroundStation).count()

    active_ground_stations = db.query(GroundStation).filter(
        GroundStation.status == "Active"
    ).count()

    maintenance_ground_stations = db.query(GroundStation).filter(
        GroundStation.status == "Maintenance"
    ).count()

    inactive_ground_stations = db.query(GroundStation).filter(
        GroundStation.status == "Inactive"
    ).count()

    # ---------------- Overall Status ----------------

    if critical_satellites > 0 or critical_telemetry > 0:
        system_status = "Attention Required"
    elif maintenance_satellites > 0 or warning_telemetry > 0:
        system_status = "Operational with Warnings"
    else:
        system_status = "Operational"

    return {
        "system_status": system_status,

        "fleet": {
            "total_satellites": total_satellites,
            "active": active_satellites,
            "maintenance": maintenance_satellites,
            "critical": critical_satellites
        },

        "missions": {
            "total": total_missions,
            "planned": planned_missions,
            "approved": approved_missions,
            "active": active_missions,
            "completed": completed_missions,
            "cancelled": cancelled_missions
        },

        "ground_stations": {
            "total": total_ground_stations,
            "active": active_ground_stations,
            "maintenance": maintenance_ground_stations,
            "inactive": inactive_ground_stations
        },

        "telemetry": {
            "total_records": total_telemetry,
            "healthy": healthy_telemetry,
            "warning": warning_telemetry,
            "critical": critical_telemetry,
            "latest_satellite": latest_satellite
        },

        "ai_engine": {
            "status": "Online",
            "model": "Rule-Based Predictive Engine",
            "prediction_service": "Active"
        }
    }