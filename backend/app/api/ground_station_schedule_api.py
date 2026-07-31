from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["Ground Station Scheduling"])


class ContactSchedule(BaseModel):
    satellite_name: str
    ground_station: str
    contact_start: str
    contact_end: str


@router.post("/ground-stations/schedule")
def schedule_contact(data: ContactSchedule):

    return {
        "message": "Ground station contact scheduled.",
        "satellite": data.satellite_name,
        "ground_station": data.ground_station,
        "window": f"{data.contact_start} - {data.contact_end}",
        "status": "Scheduled"
    }