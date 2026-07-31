import { useMemo, useState } from "react";
import {
  FaRobot,
  FaBatteryThreeQuarters,
  FaThermometerHalf,
  FaSolarPanel,
  FaHeartbeat,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTools,
  FaChartLine,
  FaLightbulb,
  FaSatellite,
  FaMicrochip,
  FaShieldAlt,
  FaRedo,
} from "react-icons/fa";

import { predictHealth } from "../services/api";

const INITIAL_FORM = {
  battery: 90,
  temperature: 30,
  solar_panel: 90,
};

function AIPrediction() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [predictionResult, setPredictionResult] = useState(null);
  const [predictionHistory, setPredictionHistory] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setError("");
  }

  function validateForm() {
    const battery = Number(formData.battery);
    const temperature = Number(formData.temperature);
    const solarPanel = Number(formData.solar_panel);

    if (
      formData.battery === "" ||
      Number.isNaN(battery) ||
      battery < 0 ||
      battery > 100
    ) {
      return "Battery health must be between 0 and 100.";
    }

    if (
      formData.temperature === "" ||
      Number.isNaN(temperature) ||
      temperature < -100 ||
      temperature > 150
    ) {
      return "Temperature must be between -100°C and 150°C.";
    }

    if (
      formData.solar_panel === "" ||
      Number.isNaN(solarPanel) ||
      solarPanel < 0 ||
      solarPanel > 100
    ) {
      return "Solar panel efficiency must be between 0 and 100.";
    }

    return "";
  }

  async function handlePredict(event) {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const requestData = {
      battery: Number(formData.battery),
      temperature: Number(formData.temperature),
      solar_panel: Number(formData.solar_panel),
    };

    try {
      setLoading(true);
      setError("");

      const result = await predictHealth(requestData);

      const completedResult = {
        ...result,
        input: requestData,
        generated_at: new Date().toLocaleTimeString(),
      };

      setPredictionResult(completedResult);

      setPredictionHistory((currentHistory) => [
        completedResult,
        ...currentHistory,
      ]);
    } catch (requestError) {
      console.error("AI prediction error:", requestError);

      setError(
        "Unable to generate the prediction. Check that the FastAPI backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  function resetPrediction() {
    setFormData(INITIAL_FORM);
    setPredictionResult(null);
    setError("");
  }

  const inputAssessment = useMemo(() => {
    const battery = Number(formData.battery);
    const temperature = Number(formData.temperature);
    const solarPanel = Number(formData.solar_panel);

    return {
      batteryStatus:
        battery < 30
          ? "Critical"
          : battery < 60
          ? "Warning"
          : "Healthy",

      temperatureStatus:
        temperature > 70
          ? "Critical"
          : temperature > 50
          ? "Warning"
          : "Healthy",

      solarStatus:
        solarPanel < 40
          ? "Critical"
          : solarPanel < 70
          ? "Warning"
          : "Healthy",
    };
  }, [formData]);

  const historySummary = useMemo(() => {
    const total = predictionHistory.length;

    const healthy = predictionHistory.filter(
      (item) =>
        String(item.prediction).toLowerCase() === "healthy"
    ).length;

    const warning = predictionHistory.filter(
      (item) =>
        String(item.prediction).toLowerCase() === "warning"
    ).length;

    const maintenance = predictionHistory.filter(
      (item) =>
        String(item.prediction).toLowerCase() ===
        "maintenance required"
    ).length;

    const averageScore =
      total > 0
        ? Math.round(
            predictionHistory.reduce(
              (totalScore, item) =>
                totalScore +
                Number(item.health_score || item.confidence || 0),
              0
            ) / total
          )
        : 0;

    return {
      total,
      healthy,
      warning,
      maintenance,
      averageScore,
    };
  }, [predictionHistory]);

  const cards = [
    {
      title: "Predictions Run",
      value: historySummary.total,
      icon: <FaRobot />,
      color: "#2563EB",
    },
    {
      title: "Healthy Results",
      value: historySummary.healthy,
      icon: <FaCheckCircle />,
      color: "#16A34A",
    },
    {
      title: "Warnings",
      value: historySummary.warning,
      icon: <FaExclamationTriangle />,
      color: "#F59E0B",
    },
    {
      title: "Maintenance Alerts",
      value: historySummary.maintenance,
      icon: <FaTools />,
      color: "#DC2626",
    },
    {
      title: "Average Health",
      value: `${historySummary.averageScore}%`,
      icon: <FaHeartbeat />,
      color: "#8B5CF6",
    },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.heading}>
            AI Predictive Maintenance
          </h2>

          <p style={styles.subtitle}>
            Analyze satellite telemetry, detect health risks and
            generate maintenance recommendations.
          </p>
        </div>

        <div style={styles.engineStatus}>
          <span style={styles.engineDot} />
          AI Engine Online
        </div>
      </div>

      {error && (
        <div style={styles.errorMessage}>
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      )}

      <div style={styles.cards}>
        {cards.map((card) => (
          <SummaryCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
          />
        ))}
      </div>

      <div style={styles.workflowPanel}>
        <WorkflowItem
          number="1"
          icon={<FaSatellite />}
          title="Telemetry Input"
          description="Receives battery, temperature and solar values."
          color="#60A5FA"
        />

        <div style={styles.workflowArrow}>→</div>

        <WorkflowItem
          number="2"
          icon={<FaMicrochip />}
          title="AI Analysis"
          description="Evaluates telemetry against health thresholds."
          color="#A78BFA"
        />

        <div style={styles.workflowArrow}>→</div>

        <WorkflowItem
          number="3"
          icon={<FaExclamationTriangle />}
          title="Risk Detection"
          description="Identifies abnormal subsystem conditions."
          color="#FBBF24"
        />

        <div style={styles.workflowArrow}>→</div>

        <WorkflowItem
          number="4"
          icon={<FaTools />}
          title="Recommendation"
          description="Suggests monitoring or maintenance action."
          color="#4ADE80"
        />
      </div>

      <div style={styles.mainGrid}>
        <div style={styles.inputPanel}>
          <div style={styles.panelHeader}>
            <div>
              <h3 style={styles.panelTitle}>
                Telemetry Analysis Input
              </h3>

              <p style={styles.panelSubtitle}>
                Enter the latest spacecraft engineering values.
              </p>
            </div>

            <div style={styles.aiIcon}>
              <FaRobot />
            </div>
          </div>

          <form onSubmit={handlePredict}>
            <TelemetryInput
              label="Battery Health"
              name="battery"
              value={formData.battery}
              onChange={handleInputChange}
              icon={<FaBatteryThreeQuarters />}
              suffix="%"
              min="0"
              max="100"
              status={inputAssessment.batteryStatus}
            />

            <TelemetryInput
              label="Temperature"
              name="temperature"
              value={formData.temperature}
              onChange={handleInputChange}
              icon={<FaThermometerHalf />}
              suffix="°C"
              min="-100"
              max="150"
              status={inputAssessment.temperatureStatus}
            />

            <TelemetryInput
              label="Solar Panel Efficiency"
              name="solar_panel"
              value={formData.solar_panel}
              onChange={handleInputChange}
              icon={<FaSolarPanel />}
              suffix="%"
              min="0"
              max="100"
              status={inputAssessment.solarStatus}
            />

            <div style={styles.thresholdInformation}>
              <FaLightbulb />

              <div>
                <strong style={styles.thresholdTitle}>
                  Prediction Thresholds
                </strong>

                <p style={styles.thresholdText}>
                  Maintenance risks are detected when battery is below
                  30%, temperature is above 70°C or solar efficiency is
                  below 40%.
                </p>
              </div>
            </div>

            <div style={styles.formActions}>
              <button
                type="button"
                style={styles.resetButton}
                onClick={resetPrediction}
                disabled={loading}
              >
                <FaRedo />
                Reset
              </button>

              <button
                type="submit"
                style={{
                  ...styles.predictButton,
                  opacity: loading ? 0.7 : 1,
                }}
                disabled={loading}
              >
                <FaRobot />
                {loading
                  ? "Analyzing Telemetry..."
                  : "Run AI Prediction"}
              </button>
            </div>
          </form>
        </div>

        <div style={styles.resultPanel}>
          {!predictionResult ? (
            <EmptyPrediction />
          ) : (
            <PredictionResult result={predictionResult} />
          )}
        </div>
      </div>

      <div style={styles.analysisGrid}>
        <SubsystemCard
          title="Battery Assessment"
          value={`${formData.battery}%`}
          status={inputAssessment.batteryStatus}
          icon={<FaBatteryThreeQuarters />}
          progressValue={Number(formData.battery)}
        />

        <SubsystemCard
          title="Temperature Assessment"
          value={`${formData.temperature}°C`}
          status={inputAssessment.temperatureStatus}
          icon={<FaThermometerHalf />}
          progressValue={getTemperatureScore(
            Number(formData.temperature)
          )}
        />

        <SubsystemCard
          title="Solar Assessment"
          value={`${formData.solar_panel}%`}
          status={inputAssessment.solarStatus}
          icon={<FaSolarPanel />}
          progressValue={Number(formData.solar_panel)}
        />
      </div>

      {predictionHistory.length > 0 && (
        <div style={styles.historyPanel}>
          <div style={styles.historyHeader}>
            <div>
              <h3 style={styles.panelTitle}>
                Current Session History
              </h3>

              <p style={styles.panelSubtitle}>
                Recent predictions generated during this browser
                session.
              </p>
            </div>

            <button
              type="button"
              style={styles.clearButton}
              onClick={() => setPredictionHistory([])}
            >
              Clear History
            </button>
          </div>

          <div style={styles.historyTableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Time</th>
                  <th style={styles.tableHeader}>Battery</th>
                  <th style={styles.tableHeader}>Temperature</th>
                  <th style={styles.tableHeader}>Solar</th>
                  <th style={styles.tableHeader}>Prediction</th>
                  <th style={styles.tableHeader}>Health Score</th>
                </tr>
              </thead>

              <tbody>
                {predictionHistory.map((item, index) => (
                  <tr key={`${item.generated_at}-${index}`}>
                    <td style={styles.tableCell}>
                      {item.generated_at}
                    </td>

                    <td style={styles.tableCell}>
                      {item.input.battery}%
                    </td>

                    <td style={styles.tableCell}>
                      {item.input.temperature}°C
                    </td>

                    <td style={styles.tableCell}>
                      {item.input.solar_panel}%
                    </td>

                    <td style={styles.tableCell}>
                      <PredictionBadge
                        prediction={item.prediction}
                      />
                    </td>

                    <td style={styles.tableCell}>
                      <strong>
                        {item.health_score ??
                          item.confidence ??
                          0}
                        %
                      </strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value, icon, color }) {
  return (
    <div style={styles.card}>
      <div
        style={{
          ...styles.cardIcon,
          backgroundColor: color,
        }}
      >
        {icon}
      </div>

      <div>
        <p style={styles.cardLabel}>{title}</p>
        <h2 style={styles.cardValue}>{value}</h2>
      </div>
    </div>
  );
}

function WorkflowItem({
  number,
  icon,
  title,
  description,
  color,
}) {
  return (
    <div style={styles.workflowItem}>
      <div
        style={{
          ...styles.workflowIcon,
          color,
          backgroundColor: `${color}18`,
        }}
      >
        {icon}
      </div>

      <div>
        <span style={styles.workflowNumber}>
          Step {number}
        </span>

        <strong style={styles.workflowTitle}>
          {title}
        </strong>

        <p style={styles.workflowDescription}>
          {description}
        </p>
      </div>
    </div>
  );
}

function TelemetryInput({
  label,
  name,
  value,
  onChange,
  icon,
  suffix,
  min,
  max,
  status,
}) {
  const statusColor = getStatusColor(status);

  return (
    <div style={styles.inputGroup}>
      <div style={styles.inputLabelRow}>
        <label style={styles.inputLabel} htmlFor={name}>
          <span style={styles.inputLabelIcon}>
            {icon}
          </span>

          {label}
        </label>

        <span
          style={{
            ...styles.smallStatus,
            color: statusColor,
            backgroundColor: `${statusColor}18`,
          }}
        >
          {status}
        </span>
      </div>

      <div style={styles.inputWrapper}>
        <input
          id={name}
          name={name}
          type="number"
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          required
          style={styles.formInput}
        />

        <span style={styles.inputSuffix}>{suffix}</span>
      </div>
    </div>
  );
}

function EmptyPrediction() {
  return (
    <div style={styles.emptyPrediction}>
      <div style={styles.emptyPredictionIcon}>
        <FaRobot />
      </div>

      <h3 style={styles.emptyPredictionTitle}>
        AI Prediction Ready
      </h3>

      <p style={styles.emptyPredictionText}>
        Enter telemetry values and run the AI engine to receive a
        satellite health prediction, confidence score, detected issues
        and maintenance recommendation.
      </p>

      <div style={styles.emptyFeatureList}>
        <span>
          <FaCheckCircle /> Health assessment
        </span>

        <span>
          <FaCheckCircle /> Issue detection
        </span>

        <span>
          <FaCheckCircle /> Maintenance advice
        </span>
      </div>
    </div>
  );
}

function PredictionResult({ result }) {
  const healthScore = Number(
    result.health_score ?? result.confidence ?? 0
  );

  const resultColor = getPredictionColor(result.prediction);

  const issues = Array.isArray(result.issues_detected)
    ? result.issues_detected
    : [];

  return (
    <div>
      <div style={styles.resultHeader}>
        <div>
          <p style={styles.resultEyebrow}>
            AI ANALYSIS COMPLETE
          </p>

          <h3 style={styles.resultTitle}>
            Satellite Health Prediction
          </h3>
        </div>

        <div
          style={{
            ...styles.resultIcon,
            color: resultColor,
            backgroundColor: `${resultColor}18`,
          }}
        >
          {String(result.prediction).toLowerCase() ===
          "healthy" ? (
            <FaCheckCircle />
          ) : String(result.prediction).toLowerCase() ===
            "warning" ? (
            <FaExclamationTriangle />
          ) : (
            <FaTools />
          )}
        </div>
      </div>

      <div style={styles.predictionMain}>
        <PredictionBadge prediction={result.prediction} />

        <div style={styles.scoreCircle}>
          <div
            style={{
              ...styles.scoreCircleInner,
              borderColor: resultColor,
            }}
          >
            <strong style={styles.scoreValue}>
              {healthScore}%
            </strong>

            <span style={styles.scoreLabel}>
              Health Score
            </span>
          </div>
        </div>
      </div>

      <div style={styles.scoreProgressBackground}>
        <div
          style={{
            ...styles.scoreProgressFill,
            width: `${Math.min(
              Math.max(healthScore, 0),
              100
            )}%`,
            backgroundColor: resultColor,
          }}
        />
      </div>

      <div style={styles.resultMetrics}>
        <ResultMetric
          title="Confidence"
          value={`${result.confidence ?? healthScore}%`}
          icon={<FaChartLine />}
          color="#60A5FA"
        />

        <ResultMetric
          title="Detected Issues"
          value={issues.length}
          icon={<FaExclamationTriangle />}
          color={issues.length > 0 ? "#F87171" : "#4ADE80"}
        />
      </div>

      <div style={styles.issuesPanel}>
        <div style={styles.resultSectionTitle}>
          <FaShieldAlt />
          Issues Detected
        </div>

        {issues.length === 0 ? (
          <div style={styles.noIssues}>
            <FaCheckCircle />
            No critical telemetry issues detected.
          </div>
        ) : (
          <div style={styles.issueList}>
            {issues.map((issue) => (
              <div key={issue} style={styles.issueItem}>
                <FaExclamationTriangle />
                {issue}
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          ...styles.recommendationPanel,
          borderColor: `${resultColor}55`,
          backgroundColor: `${resultColor}12`,
        }}
      >
        <div
          style={{
            ...styles.recommendationIcon,
            color: resultColor,
          }}
        >
          <FaLightbulb />
        </div>

        <div>
          <strong style={styles.recommendationTitle}>
            AI Recommendation
          </strong>

          <p style={styles.recommendationText}>
            {result.recommendation ||
              "Continue monitoring satellite telemetry."}
          </p>
        </div>
      </div>
    </div>
  );
}

function PredictionBadge({ prediction }) {
  const color = getPredictionColor(prediction);

  return (
    <span
      style={{
        ...styles.predictionBadge,
        color,
        backgroundColor: `${color}18`,
        borderColor: `${color}55`,
      }}
    >
      <span
        style={{
          ...styles.predictionDot,
          backgroundColor: color,
        }}
      />

      {prediction || "Unknown"}
    </span>
  );
}

function ResultMetric({ title, value, icon, color }) {
  return (
    <div style={styles.resultMetric}>
      <div
        style={{
          ...styles.resultMetricIcon,
          color,
          backgroundColor: `${color}18`,
        }}
      >
        {icon}
      </div>

      <div>
        <p style={styles.resultMetricLabel}>{title}</p>
        <strong style={styles.resultMetricValue}>
          {value}
        </strong>
      </div>
    </div>
  );
}

function SubsystemCard({
  title,
  value,
  status,
  icon,
  progressValue,
}) {
  const statusColor = getStatusColor(status);

  return (
    <div style={styles.subsystemCard}>
      <div style={styles.subsystemHeader}>
        <div
          style={{
            ...styles.subsystemIcon,
            color: statusColor,
            backgroundColor: `${statusColor}18`,
          }}
        >
          {icon}
        </div>

        <span
          style={{
            ...styles.smallStatus,
            color: statusColor,
            backgroundColor: `${statusColor}18`,
          }}
        >
          {status}
        </span>
      </div>

      <p style={styles.subsystemTitle}>{title}</p>

      <h3 style={styles.subsystemValue}>{value}</h3>

      <div style={styles.subsystemProgressBackground}>
        <div
          style={{
            ...styles.subsystemProgressFill,
            width: `${Math.min(
              Math.max(progressValue, 0),
              100
            )}%`,
            backgroundColor: statusColor,
          }}
        />
      </div>
    </div>
  );
}

function getPredictionColor(prediction) {
  const normalized = String(
    prediction || ""
  ).toLowerCase();

  if (normalized === "healthy") {
    return "#22C55E";
  }

  if (normalized === "warning") {
    return "#F59E0B";
  }

  if (normalized === "maintenance required") {
    return "#EF4444";
  }

  return "#94A3B8";
}

function getStatusColor(status) {
  const normalized = String(status).toLowerCase();

  if (normalized === "healthy") {
    return "#22C55E";
  }

  if (normalized === "warning") {
    return "#F59E0B";
  }

  if (normalized === "critical") {
    return "#EF4444";
  }

  return "#94A3B8";
}

function getTemperatureScore(temperature) {
  if (temperature > 70) {
    return 25;
  }

  if (temperature > 50) {
    return 55;
  }

  if (temperature < -20) {
    return 25;
  }

  if (temperature < 0) {
    return 55;
  }

  return 90;
}

const styles = {
  page: {
    minHeight: "100%",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
    flexWrap: "wrap",
    marginBottom: 24,
  },

  heading: {
    color: "#F8FAFC",
    margin: 0,
    fontSize: 28,
    fontWeight: 700,
  },

  subtitle: {
    color: "#94A3B8",
    margin: "8px 0 0",
    fontSize: 14,
  },

  engineStatus: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "9px 13px",
    borderRadius: 20,
    color: "#86EFAC",
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    fontSize: 13,
    fontWeight: 600,
  },

  engineDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "#22C55E",
    boxShadow: "0 0 10px rgba(34, 197, 94, 0.8)",
  },

  errorMessage: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    marginBottom: 18,
    padding: "12px 14px",
    borderRadius: 9,
    color: "#FCA5A5",
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    border: "1px solid rgba(239, 68, 68, 0.35)",
    fontSize: 13,
  },

  cards: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 18,
    marginBottom: 22,
  },

  card: {
    display: "flex",
    alignItems: "center",
    gap: 15,
    padding: 19,
    minHeight: 80,
    backgroundColor: "#1E293B",
    border: "1px solid #334155",
    borderRadius: 14,
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.12)",
  },

  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#FFFFFF",
    fontSize: 20,
    flexShrink: 0,
  },

  cardLabel: {
    color: "#94A3B8",
    margin: 0,
    fontSize: 13,
  },

  cardValue: {
    color: "#F8FAFC",
    margin: "7px 0 0",
    fontSize: 25,
  },

  workflowPanel: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    padding: 18,
    marginBottom: 22,
    backgroundColor: "#1E293B",
    border: "1px solid #334155",
    borderRadius: 14,
  },

  workflowItem: {
    display: "flex",
    alignItems: "center",
    gap: 11,
    flex: "1 1 190px",
  },

  workflowIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  workflowNumber: {
    display: "block",
    color: "#64748B",
    fontSize: 10,
    textTransform: "uppercase",
    marginBottom: 2,
  },

  workflowTitle: {
    display: "block",
    color: "#F8FAFC",
    fontSize: 13,
  },

  workflowDescription: {
    color: "#94A3B8",
    fontSize: 11,
    lineHeight: 1.4,
    margin: "4px 0 0",
  },

  workflowArrow: {
    color: "#475569",
    fontSize: 18,
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(340px, 1fr))",
    gap: 22,
    marginBottom: 22,
  },

  inputPanel: {
    padding: 22,
    backgroundColor: "#1E293B",
    border: "1px solid #334155",
    borderRadius: 14,
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.12)",
  },

  resultPanel: {
    minHeight: 530,
    padding: 22,
    backgroundColor: "#1E293B",
    border: "1px solid #334155",
    borderRadius: 14,
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.12)",
  },

  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 15,
    marginBottom: 22,
  },

  panelTitle: {
    color: "#F8FAFC",
    margin: 0,
    fontSize: 19,
  },

  panelSubtitle: {
    color: "#94A3B8",
    margin: "6px 0 0",
    fontSize: 13,
  },

  aiIcon: {
    width: 44,
    height: 44,
    borderRadius: 11,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#C4B5FD",
    backgroundColor: "rgba(139, 92, 246, 0.16)",
    fontSize: 20,
  },

  inputGroup: {
    marginBottom: 19,
  },

  inputLabelRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 8,
  },

  inputLabel: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    color: "#CBD5E1",
    fontSize: 13,
    fontWeight: 600,
  },

  inputLabelIcon: {
    color: "#60A5FA",
  },

  smallStatus: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 20,
    padding: "5px 9px",
    fontSize: 11,
    fontWeight: 600,
  },

  inputWrapper: {
    position: "relative",
  },

  formInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 48px 12px 12px",
    borderRadius: 9,
    border: "1px solid #475569",
    backgroundColor: "#0F172A",
    color: "#F8FAFC",
    outline: "none",
    fontSize: 14,
  },

  inputSuffix: {
    position: "absolute",
    right: 14,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94A3B8",
    fontSize: 13,
  },

  thresholdInformation: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: 13,
    marginTop: 5,
    borderRadius: 9,
    color: "#93C5FD",
    backgroundColor: "rgba(37, 99, 235, 0.1)",
    border: "1px solid rgba(37, 99, 235, 0.25)",
  },

  thresholdTitle: {
    color: "#BFDBFE",
    fontSize: 12,
  },

  thresholdText: {
    color: "#93C5FD",
    fontSize: 11,
    lineHeight: 1.5,
    margin: "4px 0 0",
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 11,
    marginTop: 22,
    flexWrap: "wrap",
  },

  resetButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "11px 16px",
    borderRadius: 9,
    border: "1px solid #475569",
    backgroundColor: "transparent",
    color: "#CBD5E1",
    cursor: "pointer",
    fontWeight: 600,
  },

  predictButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "11px 18px",
    borderRadius: 9,
    border: "none",
    backgroundColor: "#7C3AED",
    color: "#FFFFFF",
    cursor: "pointer",
    fontWeight: 600,
  },

  emptyPrediction: {
    minHeight: 480,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: 20,
  },

  emptyPredictionIcon: {
    width: 82,
    height: 82,
    borderRadius: 22,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#A78BFA",
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    fontSize: 38,
    marginBottom: 18,
  },

  emptyPredictionTitle: {
    color: "#F8FAFC",
    margin: 0,
  },

  emptyPredictionText: {
    maxWidth: 430,
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 1.7,
    margin: "11px 0 18px",
  },

  emptyFeatureList: {
    display: "flex",
    justifyContent: "center",
    gap: 15,
    flexWrap: "wrap",
    color: "#86EFAC",
    fontSize: 12,
  },

  resultHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 15,
  },

  resultEyebrow: {
    color: "#A78BFA",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.12em",
    margin: 0,
  },

  resultTitle: {
    color: "#F8FAFC",
    margin: "6px 0 0",
    fontSize: 19,
  },

  resultIcon: {
    width: 45,
    height: 45,
    borderRadius: 11,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
  },

  predictionMain: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
    margin: "28px 0 18px",
  },

  predictionBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 13px",
    borderRadius: 22,
    border: "1px solid",
    fontSize: 13,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  predictionDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
  },

  scoreCircle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  scoreCircleInner: {
    width: 115,
    height: 115,
    borderRadius: "50%",
    border: "8px solid",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F172A",
  },

  scoreValue: {
    color: "#F8FAFC",
    fontSize: 25,
  },

  scoreLabel: {
    color: "#94A3B8",
    fontSize: 10,
    marginTop: 4,
  },

  scoreProgressBackground: {
    height: 7,
    borderRadius: 20,
    backgroundColor: "#334155",
    overflow: "hidden",
  },

  scoreProgressFill: {
    height: "100%",
    borderRadius: 20,
    transition: "width 0.4s ease",
  },

  resultMetrics: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(150px, 1fr))",
    gap: 13,
    margin: "20px 0",
  },

  resultMetric: {
    display: "flex",
    alignItems: "center",
    gap: 11,
    padding: 13,
    borderRadius: 10,
    backgroundColor: "#0F172A",
    border: "1px solid #334155",
  },

  resultMetricIcon: {
    width: 37,
    height: 37,
    borderRadius: 9,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  resultMetricLabel: {
    color: "#94A3B8",
    fontSize: 11,
    margin: 0,
  },

  resultMetricValue: {
    display: "block",
    color: "#F8FAFC",
    marginTop: 4,
  },

  issuesPanel: {
    marginBottom: 18,
  },

  resultSectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#CBD5E1",
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 10,
  },

  noIssues: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 9,
    color: "#86EFAC",
    backgroundColor: "rgba(34, 197, 94, 0.1)",
  },

  issueList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  issueItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: 11,
    borderRadius: 9,
    color: "#FCA5A5",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },

  recommendationPanel: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    padding: 15,
    border: "1px solid",
    borderRadius: 10,
  },

  recommendationIcon: {
    fontSize: 20,
  },

  recommendationTitle: {
    color: "#F8FAFC",
    fontSize: 13,
  },

  recommendationText: {
    color: "#CBD5E1",
    fontSize: 12,
    lineHeight: 1.6,
    margin: "5px 0 0",
  },

  analysisGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(230px, 1fr))",
    gap: 18,
    marginBottom: 22,
  },

  subsystemCard: {
    padding: 18,
    backgroundColor: "#1E293B",
    border: "1px solid #334155",
    borderRadius: 14,
  },

  subsystemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  subsystemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  subsystemTitle: {
    color: "#94A3B8",
    fontSize: 12,
    margin: "16px 0 5px",
  },

  subsystemValue: {
    color: "#F8FAFC",
    margin: 0,
    fontSize: 22,
  },

  subsystemProgressBackground: {
    height: 6,
    backgroundColor: "#334155",
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 14,
  },

  subsystemProgressFill: {
    height: "100%",
    borderRadius: 20,
  },

  historyPanel: {
    padding: 20,
    backgroundColor: "#1E293B",
    border: "1px solid #334155",
    borderRadius: 14,
  },

  historyHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 15,
    flexWrap: "wrap",
    marginBottom: 18,
  },

  clearButton: {
    padding: "9px 13px",
    border: "1px solid #475569",
    borderRadius: 8,
    backgroundColor: "transparent",
    color: "#CBD5E1",
    cursor: "pointer",
  },

  historyTableContainer: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    minWidth: 760,
    borderCollapse: "collapse",
  },

  tableHeader: {
    textAlign: "left",
    color: "#94A3B8",
    fontSize: 11,
    padding: "12px 13px",
    borderBottom: "1px solid #334155",
    textTransform: "uppercase",
  },

  tableCell: {
    color: "#E2E8F0",
    fontSize: 12,
    padding: "14px 13px",
    borderBottom:
      "1px solid rgba(51, 65, 85, 0.65)",
  },
};

export default AIPrediction;