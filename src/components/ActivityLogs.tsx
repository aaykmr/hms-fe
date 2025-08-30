import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Filter,
  Download,
  Eye,
  AlertTriangle,
  Shield,
  User,
  Calendar,
  FileText,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import apiService, { ActivityLog } from "../services/api";
import "../styles/components/ActivityLogs.scss";

const ActivityLogs: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    activityType: "",
    severity: "",
    startDate: "",
    endDate: "",
    limit: 100,
  });
  const [viewMode, setViewMode] = useState<"my" | "users" | "audit">("my");

  useEffect(() => {
    fetchLogs();
  }, [viewMode, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");

      let response;
      switch (viewMode) {
        case "my":
          response = await apiService.getMyActivityLogs(filters);
          break;
        case "users":
          response = await apiService.getUserActivityLogs(filters);
          break;
        case "audit":
          response = await apiService.getAuditLogs(filters);
          break;
        default:
          response = await apiService.getMyActivityLogs(filters);
      }

      setLogs(response.logs);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle size={16} className="severity-icon critical" />;
      case "high":
        return <AlertTriangle size={16} className="severity-icon high" />;
      case "medium":
        return <Shield size={16} className="severity-icon medium" />;
      case "low":
        return <Shield size={16} className="severity-icon low" />;
      default:
        return <Shield size={16} className="severity-icon low" />;
    }
  };

  const getActivityIcon = (activityType: string) => {
    if (activityType.includes("user")) return <User size={16} />;
    if (activityType.includes("appointment")) return <Calendar size={16} />;
    if (activityType.includes("medical")) return <FileText size={16} />;
    return <Shield size={16} />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const exportLogs = () => {
    const csvContent = [
      [
        "Timestamp",
        "User",
        "Activity",
        "Description",
        "Severity",
        "IP Address",
      ],
      ...logs.map(log => [
        formatDate(log.createdAt),
        log.user?.name || "Unknown",
        log.activityType,
        log.description,
        log.severity,
        log.ipAddress || "N/A",
      ]),
    ]
      .map(row => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const canViewUserLogs =
    user?.clearanceLevel === "L3" || user?.clearanceLevel === "L4";
  const canViewAuditLogs = user?.clearanceLevel === "L4";

  return (
    <div className="activity-logs">
      <div className="container">
        <div className="page-header">
          <button
            className="btn btn--outline"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <h1>Activity Logs</h1>
        </div>

        {error && <div className="alert alert--error">{error}</div>}

        <div className="logs-controls">
          <div className="view-mode-selector">
            <button
              className={`btn ${viewMode === "my" ? "btn--primary" : "btn--outline"}`}
              onClick={() => setViewMode("my")}
            >
              My Logs
            </button>
            {canViewUserLogs && (
              <button
                className={`btn ${viewMode === "users" ? "btn--primary" : "btn--outline"}`}
                onClick={() => setViewMode("users")}
              >
                User Logs
              </button>
            )}
            {canViewAuditLogs && (
              <button
                className={`btn ${viewMode === "audit" ? "btn--primary" : "btn--outline"}`}
                onClick={() => setViewMode("audit")}
              >
                Audit Logs
              </button>
            )}
          </div>

          <div className="filters">
            <select
              value={filters.activityType}
              onChange={e =>
                setFilters({ ...filters, activityType: e.target.value })
              }
              className="form-control"
            >
              <option value="">All Activities</option>
              <option value="user_registered">User Registration</option>
              <option value="user_login">User Login</option>
              <option value="user_clearance_changed">Clearance Changes</option>
              <option value="patient_registered">Patient Registration</option>
              <option value="appointment_created">Appointment Creation</option>
              <option value="appointment_status_changed">Status Changes</option>
              <option value="medical_record_created">Medical Records</option>
            </select>

            <select
              value={filters.severity}
              onChange={e =>
                setFilters({ ...filters, severity: e.target.value })
              }
              className="form-control"
            >
              <option value="">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>

            <input
              type="date"
              value={filters.startDate}
              onChange={e =>
                setFilters({ ...filters, startDate: e.target.value })
              }
              className="form-control"
              placeholder="Start Date"
            />

            <input
              type="date"
              value={filters.endDate}
              onChange={e =>
                setFilters({ ...filters, endDate: e.target.value })
              }
              className="form-control"
              placeholder="End Date"
            />

            <select
              value={filters.limit}
              onChange={e =>
                setFilters({ ...filters, limit: parseInt(e.target.value) })
              }
              className="form-control"
            >
              <option value={50}>50 logs</option>
              <option value={100}>100 logs</option>
              <option value={200}>200 logs</option>
              <option value={500}>500 logs</option>
            </select>
          </div>

          <button className="btn btn--secondary" onClick={exportLogs}>
            <Download size={16} />
            Export CSV
          </button>
        </div>

        <div className="logs-container">
          {loading ? (
            <div className="loading">Loading logs...</div>
          ) : logs.length === 0 ? (
            <div className="no-logs">
              No logs found for the selected criteria.
            </div>
          ) : (
            <div className="logs-list">
              {logs.map(log => (
                <div
                  key={log.id}
                  className={`log-item log-item--${log.severity}`}
                >
                  <div className="log-header">
                    <div className="log-activity">
                      {getActivityIcon(log.activityType)}
                      <span className="activity-type">
                        {log.activityType.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="log-severity">
                      {getSeverityIcon(log.severity)}
                      <span
                        className={`severity-badge severity-badge--${log.severity}`}
                      >
                        {log.severity}
                      </span>
                    </div>
                  </div>

                  <div className="log-description">{log.description}</div>

                  <div className="log-meta">
                    <div className="log-user">
                      <User size={14} />
                      {log.user?.name || "Unknown User"}
                    </div>
                    <div className="log-timestamp">
                      {formatDate(log.createdAt)}
                    </div>
                    {log.ipAddress && (
                      <div className="log-ip">IP: {log.ipAddress}</div>
                    )}
                  </div>

                  {log.details && (
                    <div className="log-details">
                      <details>
                        <summary>Additional Details</summary>
                        <pre>{JSON.stringify(log.details, null, 2)}</pre>
                      </details>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;
