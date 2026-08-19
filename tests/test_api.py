import requests

BASE_URL = "http://localhost:8000"


# ---------- BASIC API TESTS ----------

def test_backend_root():
    response = requests.get(f"{BASE_URL}/")
    assert response.status_code == 200


def test_swagger_openapi():
    response = requests.get(f"{BASE_URL}/openapi.json")
    assert response.status_code == 200


def test_invalid_endpoint_returns_404():
    response = requests.get(f"{BASE_URL}/this-does-not-exist")
    assert response.status_code == 404


# ---------- MONITORING TEST ----------

def test_metrics_endpoint():
    response = requests.get(f"{BASE_URL}/metrics")

    assert response.status_code == 200
    assert "space_platform_http_requests_total" in response.text


# ---------- SATELLITE FLEET TESTS ----------

def test_get_satellites():
    response = requests.get(f"{BASE_URL}/satellites")

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_fleet_performance():
    response = requests.get(f"{BASE_URL}/satellites/performance")

    assert response.status_code == 200

    data = response.json()

    assert "fleet_size" in data
    assert "average_health" in data
    assert "fleet_status" in data


# ---------- TELEMETRY TESTS ----------

def test_healthy_telemetry_processing():

    payload = {
        "satellite_name": "TEST-SAT-01",
        "battery": 85,
        "temperature": 35,
        "solar_panel": 90,
        "communication": "Excellent",
        "payload_status": "Operational",
        "status": "Healthy"
    }

    response = requests.post(
        f"{BASE_URL}/telemetry",
        json=payload
    )

    assert response.status_code == 201

    data = response.json()

    assert data["anomaly_detected"] is False
    assert data["anomaly_count"] == 0


def test_critical_telemetry_anomaly_detection():

    payload = {
        "satellite_name": "TEST-SAT-02",
        "battery": 15,
        "temperature": 90,
        "solar_panel": 25,
        "communication": "Lost",
        "payload_status": "Offline",
        "status": "Critical"
    }

    response = requests.post(
        f"{BASE_URL}/telemetry",
        json=payload
    )

    assert response.status_code == 201

    data = response.json()

    assert data["anomaly_detected"] is True
    assert data["anomaly_count"] >= 1
    assert len(data["alerts"]) >= 1


def test_telemetry_summary():

    response = requests.get(
        f"{BASE_URL}/telemetry/summary"
    )

    assert response.status_code == 200

    data = response.json()

    assert "total_records" in data
    assert "healthy" in data
    assert "critical" in data
    assert "total_alerts" in data


# ---------- AI PREDICTIVE MAINTENANCE ----------

def test_ai_prediction():

    payload = {
        "battery": 20,
        "temperature": 80,
        "solar_panel": 30
    }

    response = requests.post(
        f"{BASE_URL}/ai/predict",
        json=payload
    )

    assert response.status_code == 200

    data = response.json()

    assert "prediction" in data
    assert "confidence" in data
    assert "health_score" in data
    assert "issues_detected" in data
    assert "recommendation" in data


# ---------- OPERATIONAL MODULES ----------

def test_dashboard():

    response = requests.get(f"{BASE_URL}/dashboard")

    assert response.status_code == 200

    data = response.json()

    assert "system_status" in data
    assert "fleet" in data
    assert "missions" in data
    assert "ground_stations" in data
    assert "telemetry" in data
    assert "ai_engine" in data


def test_mission_history():

    response = requests.get(f"{BASE_URL}/missions/history")

    assert response.status_code == 200

    data = response.json()

    assert "total_missions" in data
    assert "history" in data


def test_ground_station_report():

    response = requests.get(
        f"{BASE_URL}/ground-stations/contacts/report"
    )

    assert response.status_code == 200


# ---------- SECURITY / VALIDATION TESTS ----------

def test_invalid_login_rejected():

    response = requests.post(
        f"{BASE_URL}/auth/login",
        data={
            "username": "invalid@example.com",
            "password": "wrong-password"
        }
    )

    assert response.status_code == 401


def test_invalid_telemetry_validation():

    payload = {
        "satellite_name": "TEST-SAT-INVALID",
        "battery": 150,
        "temperature": 35,
        "solar_panel": 90,
        "communication": "Excellent",
        "payload_status": "Operational",
        "status": "Healthy"
    }

    response = requests.post(
        f"{BASE_URL}/telemetry",
        json=payload
    )

    assert response.status_code == 422