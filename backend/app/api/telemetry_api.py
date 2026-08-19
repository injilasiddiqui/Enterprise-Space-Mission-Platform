from typing import Optional
import time

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.telemetry import Telemetry
from app.models.telemetry_alert import TelemetryAlert
from app.schemas.telemetry_schema import TelemetryCreate


router = APIRouter(
    tags=["Telemetry"]
)


# -------------------------------------------------
# Telemetry anomaly detection
# -------------------------------------------------

def detect_anomalies(telemetry):
    anomalies = []

    # Battery
    if telemetry.battery < 20:
        anomalies.append({
            "alert_type": "Battery Alert",
            "severity": "Critical",
            "parameter": "battery",
            "value": telemetry.battery,
            "message": "Battery level is critically low."
        })

    elif telemetry.battery < 40:
        anomalies.append({
            "alert_type": "Battery Alert",
            "severity": "Warning",
            "parameter": "battery",
            "value": telemetry.battery,
            "message": "Battery level is below normal range."
        })

    # Temperature
    if telemetry.temperature > 80:
        anomalies.append({
            "alert_type": "Temperature Alert",
            "severity": "Critical",
            "parameter": "temperature",
            "value": telemetry.temperature,
            "message": "Spacecraft temperature is critically high."
        })

    elif telemetry.temperature > 60 or telemetry.temperature < 0:
        anomalies.append({
            "alert_type": "Temperature Alert",
            "severity": "Warning",
            "parameter": "temperature",
            "value": telemetry.temperature,
            "message": "Spacecraft temperature is outside normal range."
        })

    # Solar panel
    if telemetry.solar_panel < 30:
        anomalies.append({
            "alert_type": "Solar Panel Alert",
            "severity": "Critical",
            "parameter": "solar_panel",
            "value": telemetry.solar_panel,
            "message": "Solar panel efficiency is critically low."
        })

    elif telemetry.solar_panel < 50:
        anomalies.append({
            "alert_type": "Solar Panel Alert",
            "severity": "Warning",
            "parameter": "solar_panel",
            "value": telemetry.solar_panel,
            "message": "Solar panel efficiency is below normal range."
        })

    # Communication
    if telemetry.communication == "Lost":
        anomalies.append({
            "alert_type": "Communication Alert",
            "severity": "Critical",
            "parameter": "communication",
            "value": 0.0,
            "message": "Satellite communication has been lost."
        })
            # Payload subsystem
    if telemetry.payload_status == "Offline":
        anomalies.append({
            "alert_type": "Payload Alert",
            "severity": "Critical",
            "parameter": "payload_status",
            "value": 0.0,
            "message": "Spacecraft payload is offline."
        })

    elif telemetry.payload_status == "Degraded":
        anomalies.append({
            "alert_type": "Payload Alert",
            "severity": "Warning",
            "parameter": "payload_status",
            "value": 0.0,
            "message": "Spacecraft payload performance is degraded."
        })

    return anomalies


# -------------------------------------------------
# Process telemetry
# -------------------------------------------------

@router.post(
    "/telemetry",
    status_code=status.HTTP_201_CREATED,
    summary="Process Satellite Telemetry"
)
def create_telemetry(
    telemetry: TelemetryCreate,
    db: Session = Depends(get_db)
):
    start_time = time.perf_counter()

    anomalies = detect_anomalies(telemetry)

    # Determine health automatically
    if any(
        anomaly["severity"] == "Critical"
        for anomaly in anomalies
    ):
        calculated_status = "Critical"

    elif anomalies:
        calculated_status = "Warning"

    else:
        calculated_status = "Healthy"

    # Save telemetry
    new_telemetry = Telemetry(
        satellite_name=telemetry.satellite_name,
        battery=telemetry.battery,
        temperature=telemetry.temperature,
        solar_panel=telemetry.solar_panel,
        communication=telemetry.communication,
        payload_status=telemetry.payload_status,
        status=calculated_status
    )

    db.add(new_telemetry)
    db.commit()
    db.refresh(new_telemetry)

    # Save alerts
    for anomaly in anomalies:
        alert = TelemetryAlert(
            satellite_name=telemetry.satellite_name,
            alert_type=anomaly["alert_type"],
            severity=anomaly["severity"],
            parameter=anomaly["parameter"],
            observed_value=anomaly["value"],
            message=anomaly["message"],
            status="Open"
        )

        db.add(alert)

    db.commit()

    processing_latency_ms = round(
        (time.perf_counter() - start_time) * 1000,
        3
    )

    return {
        "message": "Telemetry processed successfully.",
        "data": {
    "id": new_telemetry.id,
    "satellite_name": new_telemetry.satellite_name,
    "battery": new_telemetry.battery,
    "temperature": new_telemetry.temperature,
    "solar_panel": new_telemetry.solar_panel,
    "communication": new_telemetry.communication,
    "payload_status": new_telemetry.payload_status,
    "status": new_telemetry.status
},
        "anomaly_detected": bool(anomalies),
        "anomaly_count": len(anomalies),
        "alerts": anomalies,
        "processing_latency_ms": processing_latency_ms
    }


# -------------------------------------------------
# Get telemetry
# -------------------------------------------------

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


# -------------------------------------------------
# Telemetry alerts
# IMPORTANT: keep this above /telemetry/{telemetry_id}
# -------------------------------------------------

@router.get(
    "/telemetry/alerts",
    summary="Get Telemetry Alerts"
)
def get_telemetry_alerts(
    db: Session = Depends(get_db)
):
    alerts = (
        db.query(TelemetryAlert)
        .order_by(TelemetryAlert.id.desc())
        .all()
    )

    return {
        "total_alerts": len(alerts),
        "alerts": alerts
    }


# -------------------------------------------------
# Telemetry summary
# -------------------------------------------------

@router.get(
    "/telemetry/summary",
    summary="Telemetry Summary"
)
def telemetry_summary(
    db: Session = Depends(get_db)
):
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

    total_alerts = db.query(
        TelemetryAlert
    ).count()

    return {
        "total_records": total,
        "healthy": healthy,
        "warning": warning,
        "critical": critical,
        "total_alerts": total_alerts
    }


# -------------------------------------------------
# Get telemetry by ID
# -------------------------------------------------

@router.get(
    "/telemetry/{telemetry_id}",
    summary="Get Telemetry by ID"
)
def get_telemetry_by_id(
    telemetry_id: int,
    db: Session = Depends(get_db)
):
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


# -------------------------------------------------
# Delete telemetry
# -------------------------------------------------

@router.delete(
    "/telemetry/{telemetry_id}",
    summary="Delete Telemetry Record"
)
def delete_telemetry(
    telemetry_id: int,
    db: Session = Depends(get_db)
):
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