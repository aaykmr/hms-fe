import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Settings,
  Activity,
  Heart,
  Droplets,
  Wind,
  Eye,
  Edit,
  Trash2,
  Power,
  PowerOff,
  RefreshCw,
  Download,
  Clock,
  User,
  Bed,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import apiService, { PatientMonitor, VitalSigns } from "../services/api";
import VitalSignsChart from "./VitalSignsChart";
import "../styles/components/PatientMonitoring.scss";

const PatientMonitoring: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [monitors, setMonitors] = useState<PatientMonitor[]>([]);
  const [selectedMonitor, setSelectedMonitor] = useState<PatientMonitor | null>(
    null
  );
  const [vitalSigns, setVitalSigns] = useState<VitalSigns[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [viewMode, setViewMode] = useState<
    "overview" | "detail" | "add" | "edit"
  >("overview");
  const [pollingInterval, setPollingInterval] = useState(1000); // 1 second
  const [isPolling, setIsPolling] = useState(true);
  const [graphUpdateInterval, setGraphUpdateInterval] = useState(2000); // 2 seconds for graph updates

  // Form state for adding new bed
  const [newBedForm, setNewBedForm] = useState({
    bedId: "",
    patientId: "",
    patientName: "",
  });

  // Form state for editing patient info
  const [editPatientForm, setEditPatientForm] = useState({
    patientId: "",
    patientName: "",
  });

  useEffect(() => {
    if (viewMode === "overview") {
      fetchMonitors();
    }
  }, [viewMode]);

  useEffect(() => {
    if (selectedMonitor && viewMode === "detail") {
      fetchVitalSigns();
    }
  }, [selectedMonitor, viewMode]);

  // Graph update polling
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (selectedMonitor && viewMode === "detail" && isPolling) {
      interval = setInterval(() => {
        fetchVitalSigns();
      }, graphUpdateInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedMonitor, viewMode, isPolling, graphUpdateInterval]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPolling && viewMode === "overview") {
      interval = setInterval(() => {
        fetchMonitors();
      }, pollingInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPolling, pollingInterval, viewMode]);

  const fetchMonitors = async () => {
    try {
      const response = await apiService.getAllMonitors();
      setMonitors(response.monitors);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch monitors");
      setLoading(false);
    }
  };

  const fetchVitalSigns = async () => {
    if (!selectedMonitor) return;

    try {
      const response = await apiService.getMonitorVitalSigns(
        selectedMonitor.bedId,
        100
      );
      setVitalSigns(response.vitalSigns);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch vital signs");
    }
  };

  const handleAddBed = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      await apiService.addNewBed(newBedForm);
      setSuccess("Monitoring bed added successfully!");
      setViewMode("overview");
      setNewBedForm({ bedId: "", patientId: "", patientName: "" });
      fetchMonitors();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add monitoring bed");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBed = async (bedId: string) => {
    if (
      !window.confirm("Are you sure you want to remove this monitoring bed?")
    ) {
      return;
    }

    try {
      await apiService.removeBed(bedId);
      setSuccess("Monitoring bed removed successfully!");
      fetchMonitors();
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to remove monitoring bed"
      );
    }
  };

  const handleUpdatePatientInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMonitor) return;

    try {
      setLoading(true);
      setError("");

      await apiService.updatePatientInfo(
        selectedMonitor.bedId,
        editPatientForm
      );
      setSuccess("Patient information updated successfully!");
      setViewMode("detail");
      setEditPatientForm({ patientId: "", patientName: "" });
      fetchMonitors();
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to update patient information"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSetBedStatus = async (bedId: string, isActive: boolean) => {
    try {
      await apiService.setBedStatus(bedId, isActive);
      setSuccess(`Bed ${isActive ? "activated" : "deactivated"} successfully!`);
      fetchMonitors();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update bed status");
    }
  };

  const getVitalStatus = (type: string, value: number) => {
    switch (type) {
      case "hr":
        if (value < 60) return "critical";
        if (value < 100) return "normal";
        return "warning";
      case "abpSys":
        if (value < 90) return "critical";
        if (value < 140) return "normal";
        return "warning";
      case "abpDia":
        if (value < 60) return "critical";
        if (value < 90) return "normal";
        return "warning";
      case "spo2":
        if (value < 90) return "critical";
        if (value < 95) return "warning";
        return "normal";
      case "resp":
        if (value < 12 || value > 20) return "warning";
        return "normal";
      default:
        return "normal";
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString();
  };

  const canManageBeds =
    user?.clearanceLevel === "L3" || user?.clearanceLevel === "L4";

  if (viewMode === "add") {
    return (
      <div className="patient-monitoring">
        <div className="container">
          <div className="page-header">
            <button
              className="btn btn--outline"
              onClick={() => setViewMode("overview")}
            >
              <ArrowLeft size={20} />
              Back to Monitoring
            </button>
            <h1>Add Monitoring Bed</h1>
          </div>

          {error && <div className="alert alert--error">{error}</div>}

          <div className="add-bed-form-container">
            <form onSubmit={handleAddBed} className="add-bed-form">
              <div className="form-group">
                <label htmlFor="bedId">Bed ID *</label>
                <input
                  type="text"
                  id="bedId"
                  value={newBedForm.bedId}
                  onChange={e =>
                    setNewBedForm({ ...newBedForm, bedId: e.target.value })
                  }
                  required
                  placeholder="e.g., BED001"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="patientId">Patient ID *</label>
                <input
                  type="text"
                  id="patientId"
                  value={newBedForm.patientId}
                  onChange={e =>
                    setNewBedForm({ ...newBedForm, patientId: e.target.value })
                  }
                  required
                  placeholder="e.g., P001"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="patientName">Patient Name *</label>
                <input
                  type="text"
                  id="patientName"
                  value={newBedForm.patientName}
                  onChange={e =>
                    setNewBedForm({
                      ...newBedForm,
                      patientName: e.target.value,
                    })
                  }
                  required
                  placeholder="Enter patient name"
                  className="form-control"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() => setViewMode("overview")}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add Bed"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === "detail" && selectedMonitor) {
    return (
      <div className="patient-monitoring">
        <div className="container">
          <div className="page-header">
            <button
              className="btn btn--outline"
              onClick={() => setViewMode("overview")}
            >
              <ArrowLeft size={20} />
              Back to Overview
            </button>
            <h1>Patient Monitor - {selectedMonitor.bedId}</h1>
            <div className="header-actions">
              <button
                className="btn btn--outline"
                onClick={() => {
                  setEditPatientForm({
                    patientId: selectedMonitor.patientId,
                    patientName: selectedMonitor.patientName,
                  });
                  setViewMode("edit");
                }}
              >
                <Edit size={16} />
                Edit Patient
              </button>
              <button
                className={`btn ${selectedMonitor.isActive ? "btn--warning" : "btn--success"}`}
                onClick={() =>
                  handleSetBedStatus(
                    selectedMonitor.bedId,
                    !selectedMonitor.isActive
                  )
                }
              >
                {selectedMonitor.isActive ? (
                  <PowerOff size={16} />
                ) : (
                  <Power size={16} />
                )}
                {selectedMonitor.isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>

          {error && <div className="alert alert--error">{error}</div>}
          {success && <div className="alert alert--success">{success}</div>}

          <div className="monitor-detail-container">
            <div className="patient-info-card">
              <div className="patient-header">
                <div className="patient-info-left">
                  <User size={24} />
                  <div>
                    <h2>{selectedMonitor.patientName}</h2>
                    <p>Patient ID: {selectedMonitor.patientId}</p>
                    <p>Bed: {selectedMonitor.bedId}</p>
                  </div>
                </div>

                {/* Compact Vital Signs Display */}
                {selectedMonitor.currentVitals && (
                  <div className="compact-vitals">
                    <div className="compact-vital-item">
                      <Heart />
                      <span className="vital-label">HR:</span>
                      <span className="vital-value">
                        {selectedMonitor.currentVitals.hr}
                      </span>
                      <span className="vital-unit">bpm</span>
                    </div>
                    <div className="compact-vital-item">
                      <Droplets />
                      <span className="vital-label">BP:</span>
                      <span className="vital-value">
                        {selectedMonitor.currentVitals.abpSys}/
                        {selectedMonitor.currentVitals.abpDia}
                      </span>
                      <span className="vital-unit">mmHg</span>
                    </div>
                    <div className="compact-vital-item">
                      <Activity />
                      <span className="vital-label">SpO2:</span>
                      <span className="vital-value">
                        {selectedMonitor.currentVitals.spo2}
                      </span>
                      <span className="vital-unit">%</span>
                    </div>
                    <div className="compact-vital-item">
                      <Wind />
                      <span className="vital-label">RR:</span>
                      <span className="vital-value">
                        {selectedMonitor.currentVitals.resp}
                      </span>
                      <span className="vital-unit">breaths/min</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="status-indicator">
                <span
                  className={`status-badge status-badge--${selectedMonitor.isActive ? "active" : "inactive"}`}
                >
                  {selectedMonitor.isActive ? "Active" : "Inactive"}
                </span>
                <div className="last-update">
                  Last Update:{" "}
                  {new Date(selectedMonitor.lastUpdate).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="vital-signs-chart">
              <div className="chart-header">
                <h3>Real-Time Vital Signs Trends</h3>
                <div className="chart-controls">
                  <label htmlFor="graphUpdateInterval">
                    Graph Update (ms):
                  </label>
                  <select
                    id="graphUpdateInterval"
                    value={graphUpdateInterval}
                    onChange={e =>
                      setGraphUpdateInterval(parseInt(e.target.value))
                    }
                    className="form-control"
                  >
                    <option value={1000}>1s (Fast)</option>
                    <option value={2000}>2s (Standard)</option>
                    <option value={5000}>5s (Slow)</option>
                    <option value={10000}>10s (Very Slow)</option>
                  </select>
                </div>
              </div>

              <div className="chart-container">
                {vitalSigns.length > 0 ? (
                  <div className="charts-column">
                    {/* Heart Rate Chart */}
                    <VitalSignsChart
                      title="Heart Rate"
                      vitalSigns={vitalSigns}
                      dataKey="hr"
                      colors={{
                        primary: "#ff6b6b",
                        gradient: "#ff6b6b",
                      }}
                      unit="bpm"
                      autoScale={true}
                      padding={15}
                      labelSize={5}
                      gridOpacity={0.15}
                      lineWidth={0.5}
                      pointRadius={1}
                    />

                    {/* Blood Pressure Chart */}
                    <VitalSignsChart
                      title="Blood Pressure"
                      vitalSigns={vitalSigns}
                      dataKey="abpSys"
                      colors={{
                        primary: "#ffa726",
                        secondary: "#4ecdc4",
                        gradient: "#ffa726",
                      }}
                      unit="mmHg"
                      showSecondaryLine={true}
                      secondaryDataKey="abpDia"
                      secondaryLineStyle="dashed"
                      autoScale={true}
                      padding={15}
                      labelSize={5}
                      gridOpacity={0.15}
                      lineWidth={0.5}
                      pointRadius={1}
                    />
                    {/* SpO2 Chart */}
                    <VitalSignsChart
                      title="SpO2"
                      vitalSigns={vitalSigns}
                      dataKey="spo2"
                      colors={{
                        primary: "#45b7d1",
                        gradient: "#45b7d1",
                      }}
                      unit="%"
                      autoScale={true}
                      padding={15}
                      labelSize={5}
                      gridOpacity={0.15}
                      lineWidth={0.5}
                      pointRadius={1}
                    />

                    {/* Respiratory Rate Chart */}
                    <VitalSignsChart
                      title="Respiratory Rate"
                      vitalSigns={vitalSigns}
                      dataKey="resp"
                      colors={{
                        primary: "#96ceb4",
                        gradient: "#96ceb4",
                      }}
                      unit="breaths/min"
                      autoScale={true}
                      padding={15}
                      labelSize={5}
                      gridOpacity={0.15}
                      lineWidth={0.5}
                      pointRadius={1}
                    />
                  </div>
                ) : (
                  <div className="no-data">No vital signs data available</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === "edit") {
    return (
      <div className="patient-monitoring">
        <div className="container">
          <div className="page-header">
            <button
              className="btn btn--outline"
              onClick={() => setViewMode("detail")}
            >
              <ArrowLeft size={20} />
              Back to Monitor
            </button>
            <h1>Edit Patient Information</h1>
          </div>

          {error && <div className="alert alert--error">{error}</div>}

          <div className="edit-patient-form-container">
            <form
              onSubmit={handleUpdatePatientInfo}
              className="edit-patient-form"
            >
              <div className="form-group">
                <label htmlFor="editPatientId">Patient ID *</label>
                <input
                  type="text"
                  id="editPatientId"
                  value={editPatientForm.patientId}
                  onChange={e =>
                    setEditPatientForm({
                      ...editPatientForm,
                      patientId: e.target.value,
                    })
                  }
                  required
                  placeholder="e.g., P001"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="editPatientName">Patient Name *</label>
                <input
                  type="text"
                  id="editPatientName"
                  value={editPatientForm.patientName}
                  onChange={e =>
                    setEditPatientForm({
                      ...editPatientForm,
                      patientName: e.target.value,
                    })
                  }
                  required
                  placeholder="Enter patient name"
                  className="form-control"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() => setViewMode("detail")}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-monitoring">
      <div className="container">
        <div className="page-header">
          <button
            className="btn btn--outline"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <h1>Patient Monitoring</h1>
          <div className="header-actions">
            {canManageBeds && (
              <button
                className="btn btn--primary"
                onClick={() => setViewMode("add")}
              >
                <Plus size={16} />
                Add Bed
              </button>
            )}
            <button
              className={`btn ${isPolling ? "btn--warning" : "btn--success"}`}
              onClick={() => setIsPolling(!isPolling)}
            >
              {isPolling ? <PowerOff size={16} /> : <Power size={16} />}
              {isPolling ? "Stop Polling" : "Start Polling"}
            </button>
            <button className="btn btn--outline" onClick={fetchMonitors}>
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {error && <div className="alert alert--error">{error}</div>}
        {success && <div className="alert alert--success">{success}</div>}

        <div className="monitoring-controls">
          <div className="polling-controls">
            <label htmlFor="pollingInterval">Polling Interval (ms):</label>
            <select
              id="pollingInterval"
              value={pollingInterval}
              onChange={e => setPollingInterval(parseInt(e.target.value))}
              className="form-control"
            >
              <option value={500}>500ms (Fast)</option>
              <option value={1000}>1s (Standard)</option>
              <option value={2000}>2s (Slow)</option>
              <option value={5000}>5s (Very Slow)</option>
            </select>
          </div>
        </div>

        <div className="monitors-overview">
          {loading ? (
            <div className="loading">Loading monitors...</div>
          ) : monitors.length === 0 ? (
            <div className="no-monitors">
              <Bed size={48} />
              <h3>No monitoring beds found</h3>
              <p>Add a new monitoring bed to get started.</p>
            </div>
          ) : (
            <div className="monitors-grid">
              {monitors.map(monitor => (
                <div
                  key={monitor.bedId}
                  className={`monitor-card monitor-card--${monitor.isActive ? "active" : "inactive"}`}
                >
                  <div className="monitor-header">
                    <div className="bed-info">
                      <Bed size={20} />
                      <h3>{monitor.bedId}</h3>
                    </div>
                    <div className="monitor-actions">
                      <button
                        className="btn btn--outline btn--sm"
                        onClick={() => {
                          setSelectedMonitor(monitor);
                          setViewMode("detail");
                        }}
                      >
                        <Eye size={14} />
                        View
                      </button>
                      {canManageBeds && (
                        <>
                          <button
                            className="btn btn--outline btn--sm"
                            onClick={() => handleRemoveBed(monitor.bedId)}
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="patient-info">
                    <User size={16} />
                    <div>
                      <h4>{monitor.patientName}</h4>
                      <p>ID: {monitor.patientId}</p>
                    </div>
                  </div>

                  <div className="vital-signs-summary">
                    {monitor.currentVitals ? (
                      <div className="vitals-grid">
                        <div className="vital-item">
                          <Heart size={14} />
                          <span>{monitor.currentVitals.hr}</span>
                        </div>
                        <div className="vital-item">
                          <Droplets size={14} />
                          <span>
                            {monitor.currentVitals.abpSys}/
                            {monitor.currentVitals.abpDia}
                          </span>
                        </div>
                        <div className="vital-item">
                          <Activity size={14} />
                          <span>{monitor.currentVitals.spo2}%</span>
                        </div>
                        <div className="vital-item">
                          <Wind size={14} />
                          <span>{monitor.currentVitals.resp}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="no-vitals">No vital signs data</div>
                    )}
                  </div>

                  <div className="monitor-footer">
                    <div className="status">
                      <span
                        className={`status-indicator status-indicator--${monitor.isActive ? "active" : "inactive"}`}
                      >
                        {monitor.isActive ? "●" : "○"}
                      </span>
                      {monitor.isActive ? "Active" : "Inactive"}
                    </div>
                    <div className="last-update">
                      <Clock size={12} />
                      {new Date(monitor.lastUpdate).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientMonitoring;
