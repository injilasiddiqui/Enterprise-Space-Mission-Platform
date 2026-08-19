from fastapi import APIRouter

from app.orbital.orbital_service import (
    check_ground_station_visibility,
    predict_next_pass,
)


router = APIRouter(tags=["Satellite Visibility"])


@router.get(
    "/visibility/current",
    summary="Check Current Satellite Visibility"
)
def current_visibility():
    """
    Calculate current satellite visibility from the
    Islamabad Ground Station using TLE/SGP4 propagation.
    """

    return check_ground_station_visibility()


@router.get(
    "/visibility/next-pass",
    summary="Predict Next Communication Pass"
)
def next_communication_pass():
    """
    Predict satellite communication passes over the
    Islamabad Ground Station during the next 24 hours.
    """

    return predict_next_pass()