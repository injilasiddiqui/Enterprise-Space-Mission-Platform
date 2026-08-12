from datetime import timedelta
from skyfield.api import EarthSatellite, load, wgs84


# Example TLE for demonstration/testing
SATELLITE_NAME = "ISS (ZARYA)"

TLE_LINE_1 = (
    "1 25544U 98067A   24120.50000000  "
    ".00016717  00000-0  30235-3 0  9999"
)

TLE_LINE_2 = (
    "2 25544  51.6400 100.0000 0005000 "
    "120.0000 240.0000 15.50000000450000"
)


def get_satellite_position():
    """
    Propagate a satellite orbit from TLE data and return
    its current geodetic position.
    """

    ts = load.timescale()

    satellite = EarthSatellite(
        TLE_LINE_1,
        TLE_LINE_2,
        SATELLITE_NAME,
        ts
    )

    # Current UTC time
    current_time = ts.now()

    # Propagate satellite orbit
    geocentric = satellite.at(current_time)

    # Convert to Earth latitude / longitude / altitude
    subpoint = geocentric.subpoint()

    latitude = subpoint.latitude.degrees
    longitude = subpoint.longitude.degrees
    altitude = subpoint.elevation.km

    return {
        "satellite": SATELLITE_NAME,
        "latitude": round(latitude, 4),
        "longitude": round(longitude, 4),
        "altitude_km": round(altitude, 2),
        "coordinate_frame": "WGS84",
        "orbit_source": "TLE",
        "propagation_method": "SGP4 via Skyfield"
    }
def check_ground_station_visibility():
    """
    Calculate satellite visibility from Islamabad Ground Station.
    """

    ts = load.timescale()

    satellite = EarthSatellite(
        TLE_LINE_1,
        TLE_LINE_2,
        SATELLITE_NAME,
        ts
    )

    ground_station = wgs84.latlon(
        latitude_degrees=33.6844,
        longitude_degrees=73.0479
    )

    current_time = ts.now()

    difference = satellite - ground_station
    topocentric = difference.at(current_time)

    altitude, azimuth, distance = topocentric.altaz()

    elevation = altitude.degrees
    azimuth_degrees = azimuth.degrees
    distance_km = distance.km

    minimum_elevation = 10.0
    visible = elevation >= minimum_elevation

    return {
        "ground_station": "Islamabad Ground Station",
        "ground_station_latitude": 33.6844,
        "ground_station_longitude": 73.0479,
        "satellite": SATELLITE_NAME,
        "elevation_degrees": round(float(elevation), 2),
        "azimuth_degrees": round(float(azimuth_degrees), 2),
        "distance_km": round(float(distance_km), 2),
        "minimum_elevation_degrees": minimum_elevation,
        "visible": bool(visible),
        "communication_status": (
            "AVAILABLE" if visible else "NOT AVAILABLE"
        )
    }
def predict_next_pass():
    """
    Predict the next satellite communication pass
    over Islamabad Ground Station.
    """

    ts = load.timescale()

    satellite = EarthSatellite(
        TLE_LINE_1,
        TLE_LINE_2,
        SATELLITE_NAME,
        ts
    )

    ground_station = wgs84.latlon(
        latitude_degrees=33.6844,
        longitude_degrees=73.0479
    )

    # Search for passes during the next 24 hours
    start_time = ts.now()
    end_time = ts.from_datetime(
        start_time.utc_datetime() + timedelta(hours=24)
    )

    minimum_elevation = 10.0

    times, events = satellite.find_events(
        ground_station,
        start_time,
        end_time,
        altitude_degrees=minimum_elevation
    )

    event_names = {
        0: "Rise",
        1: "Maximum Elevation",
        2: "Set"
    }

    pass_events = []

    for time, event in zip(times, events):
        pass_events.append({
            "event": event_names[int(event)],
            "time_utc": time.utc_strftime(
                "%Y-%m-%d %H:%M:%S UTC"
            )
        })

    if not pass_events:
        return {
            "satellite": SATELLITE_NAME,
            "ground_station": "Islamabad Ground Station",
            "minimum_elevation_degrees": minimum_elevation,
            "search_period_hours": 24,
            "status": "NO PASS FOUND",
            "events": []
        }

    return {
        "satellite": SATELLITE_NAME,
        "ground_station": "Islamabad Ground Station",
        "minimum_elevation_degrees": minimum_elevation,
        "search_period_hours": 24,
        "status": "PASS PREDICTED",
        "events": pass_events
    }
def check_orbital_deviation(
    expected_altitude_km=250.0,
    deviation_threshold_km=10.0
):
    """
    Compare propagated altitude with an expected mission altitude
    and flag significant orbital deviation.
    """

    position = get_satellite_position()

    actual_altitude = float(position["altitude_km"])

    deviation = abs(
        actual_altitude - expected_altitude_km
    )

    deviation_detected = (
        deviation > deviation_threshold_km
    )

    return {
        "satellite": SATELLITE_NAME,
        "expected_altitude_km": expected_altitude_km,
        "actual_altitude_km": actual_altitude,
        "deviation_km": round(deviation, 2),
        "deviation_threshold_km": deviation_threshold_km,
        "deviation_detected": deviation_detected,
        "status": (
            "ORBITAL DEVIATION DETECTED"
            if deviation_detected
            else "ORBIT WITHIN ACCEPTABLE RANGE"
        )
    }

if __name__ == "__main__":
    print("\n--- Satellite Position ---")
    print(get_satellite_position())

    print("\n--- Ground Station Visibility ---")
    print(check_ground_station_visibility())
    
if __name__ == "__main__":
    print("\n--- Satellite Position ---")
    print(get_satellite_position())

    print("\n--- Ground Station Visibility ---")
    print(check_ground_station_visibility())

    print("\n--- Next Communication Pass ---")
    print(predict_next_pass())