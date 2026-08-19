from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.ground_station_contact import GroundStationContact


router = APIRouter(tags=["Ground Station Scheduling"])


class ContactSchedule(BaseModel):
    satellite_name: str
    ground_station: str
    contact_start: str
    contact_end: str


class ContactResult(BaseModel):
    contact_result: str
    failure_reason: Optional[str] = None
    duration_minutes: Optional[int] = None


@router.post("/ground-stations/schedule")
def schedule_contact(
    data: ContactSchedule,
    db: Session = Depends(get_db)
):
    """
    Schedule and store a satellite-ground-station contact.
    """

    contact = GroundStationContact(
        satellite_name=data.satellite_name,
        ground_station=data.ground_station,
        contact_start=data.contact_start,
        contact_end=data.contact_end,
        contact_result="Scheduled"
    )

    db.add(contact)
    db.commit()
    db.refresh(contact)

    return {
        "message": "Ground station contact scheduled.",
        "contact_id": contact.id,
        "satellite": contact.satellite_name,
        "ground_station": contact.ground_station,
        "window": f"{contact.contact_start} - {contact.contact_end}",
        "status": contact.contact_result
    }


@router.put("/ground-stations/contacts/{contact_id}/result")
def update_contact_result(
    contact_id: int,
    data: ContactResult,
    db: Session = Depends(get_db)
):
    """
    Record the operational result of a scheduled contact.
    """

    contact = db.query(GroundStationContact).filter(
        GroundStationContact.id == contact_id
    ).first()

    if contact is None:
        raise HTTPException(
            status_code=404,
            detail="Contact record not found."
        )

    contact.contact_result = data.contact_result
    contact.failure_reason = data.failure_reason
    contact.duration_minutes = data.duration_minutes

    db.commit()
    db.refresh(contact)

    return {
        "message": "Contact result recorded.",
        "contact": contact
    }


@router.get("/ground-stations/contacts/history")
def contact_history(
    db: Session = Depends(get_db)
):
    """
    Return ground-station contact history.
    """

    contacts = (
        db.query(GroundStationContact)
        .order_by(GroundStationContact.id.desc())
        .all()
    )

    return {
        "total_contacts": len(contacts),
        "history": contacts
    }


@router.get("/ground-stations/contacts/report")
def contact_report(
    db: Session = Depends(get_db)
):
    """
    Return operational contact and utilization statistics.
    """

    contacts = db.query(GroundStationContact).all()

    total = len(contacts)

    successful = sum(
        1 for contact in contacts
        if contact.contact_result == "Successful"
    )

    failed = sum(
        1 for contact in contacts
        if contact.contact_result == "Failed"
    )

    scheduled = sum(
        1 for contact in contacts
        if contact.contact_result == "Scheduled"
    )

    total_contact_minutes = sum(
        contact.duration_minutes or 0
        for contact in contacts
    )

    success_rate = (
        round((successful / (successful + failed)) * 100, 2)
        if (successful + failed) > 0
        else 0
    )

    return {
        "total_contacts": total,
        "successful_contacts": successful,
        "failed_contacts": failed,
        "scheduled_contacts": scheduled,
        "contact_success_rate_percent": success_rate,
        "total_contact_minutes": total_contact_minutes
    }