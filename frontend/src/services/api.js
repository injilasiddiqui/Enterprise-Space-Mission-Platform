const BASE_URL = "http://127.0.0.1:8000";

async function fetchData(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let errorData;

    try {
      errorData = await response.json();
    } catch {
      errorData = {
        detail: `Request failed with status ${response.status}`,
      };
    }

    console.error("Backend Error:", errorData);

    const message =
      errorData?.detail ||
      errorData?.message ||
      `Request failed with status ${response.status}`;

    throw new Error(
      typeof message === "string"
        ? message
        : JSON.stringify(message)
    );
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return null;
  }

  return response.json();
}

/* ---------------- Dashboard ---------------- */

export const getDashboard = () =>
  fetchData("/dashboard");

/* ---------------- Satellites ---------------- */

export const getSatellites = () =>
  fetchData("/satellites");

export const getFleetPerformance = () =>
  fetchData("/satellites/performance");

export const createSatellite = (satellite) =>
  fetchData("/satellites", {
    method: "POST",
    body: JSON.stringify(satellite),
  });

export const updateSatellite = (id, satellite) =>
  fetchData(`/satellites/${id}`, {
    method: "PUT",
    body: JSON.stringify(satellite),
  });

export const deleteSatellite = (id) =>
  fetchData(`/satellites/${id}`, {
    method: "DELETE",
  });

/* ---------------- Telemetry ---------------- */

export const getTelemetry = () =>
  fetchData("/telemetry");

export const createTelemetry = (telemetry) =>
  fetchData("/telemetry", {
    method: "POST",
    body: JSON.stringify(telemetry),
  });

export const deleteTelemetry = (id) =>
  fetchData(`/telemetry/${id}`, {
    method: "DELETE",
  });

/* ---------------- Missions ---------------- */

export const getMissions = () =>
  fetchData("/missions");

export const createMission = (mission) =>
  fetchData("/missions", {
    method: "POST",
    body: JSON.stringify(mission),
  });

export const updateMission = (id, mission) =>
  fetchData(`/missions/${id}`, {
    method: "PUT",
    body: JSON.stringify(mission),
  });

export const deleteMission = (id) =>
  fetchData(`/missions/${id}`, {
    method: "DELETE",
  });

export const approveMission = (id) =>
  fetchData(`/missions/${id}/approve`, {
    method: "PUT",
  });

/* ---------------- Ground Stations ---------------- */

export const getGroundStations = () =>
  fetchData("/ground-stations");

export const createGroundStation = (station) =>
  fetchData("/ground-stations", {
    method: "POST",
    body: JSON.stringify(station),
  });

export const updateGroundStation = (id, station) =>
  fetchData(`/ground-stations/${id}`, {
    method: "PUT",
    body: JSON.stringify(station),
  });

export const deleteGroundStation = (id) =>
  fetchData(`/ground-stations/${id}`, {
    method: "DELETE",
  });

/* ---------------- AI Prediction ---------------- */

export const predictHealth = (data) =>
  fetchData("/ai/predict", {
    method: "POST",
    body: JSON.stringify(data),
  });