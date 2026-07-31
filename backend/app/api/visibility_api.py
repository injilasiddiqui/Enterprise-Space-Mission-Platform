from fastapi import APIRouter

router = APIRouter(tags=["Satellite Visibility"])


@router.get("/visibility/{satellite_name}")
def satellite_visibility(satellite_name: str):

    return {
        "satellite": satellite_name,
        "visible": True,
        "next_pass": "2026-08-02 13:45 UTC",
        "duration": "11 Minutes",
        "ground_station": "Karachi Ground Station"
    }