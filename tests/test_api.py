import requests

BASE_URL = "http://localhost:8000"


def test_backend_root():
    response = requests.get(f"{BASE_URL}/")
    assert response.status_code == 200


def test_swagger_openapi():
    response = requests.get(f"{BASE_URL}/openapi.json")
    assert response.status_code == 200


def test_metrics_endpoint():
    response = requests.get(f"{BASE_URL}/metrics")
    assert response.status_code == 200
    assert "space_platform_http_requests_total" in response.text


def test_invalid_endpoint_returns_404():
    response = requests.get(f"{BASE_URL}/this-does-not-exist")
    assert response.status_code == 404