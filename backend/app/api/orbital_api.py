from app.orbital.orbital_service import (
    get_satellite_position,
    check_ground_station_visibility,
    predict_next_pass,
    check_orbital_deviation,
)
from fastapi import APIRouter

from app.orbital.orbital_service import (
    get_satellite_position,
    check_ground_station_visibility,
    predict_next_pass,
)


router = APIRouter(
    prefix="/orbital",
    tags=["Orbital Analytics"]
)


@router.get(
    "/position",
    summary="Get Satellite Orbital Position"
)
def satellite_position():
    """
    Calculate satellite position using TLE data,
    Skyfield and SGP4 orbit propagation.
    """

    return get_satellite_position()


@router.get(
    "/visibility",
    summary="Check Ground Station Visibility"
)
def satellite_visibility():
    """
    Check satellite visibility from the
    Islamabad Ground Station.
    """

    return check_ground_station_visibility()


@router.get(
    "/next-pass",
    summary="Predict Next Communication Pass"
)
def next_communication_pass():
    """
    Predict satellite communication passes
    using a 10-degree minimum elevation constraint.
    """

    return predict_next_pass()
@router.get(
    "/deviation",
    summary="Check Satellite Orbital Deviation"
)
def orbital_deviation():
    return check_orbital_deviation()