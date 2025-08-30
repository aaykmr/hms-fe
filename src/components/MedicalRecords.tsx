import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Edit,
  Eye,
  Calendar,
  User,
  FileText,
  Stethoscope,
  Pill,
  Activity,
  Download,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import apiService, {
  MedicalRecord,
  Patient,
  User as UserType,
  Appointment,
} from "../services/api";
import "../styles/components/MedicalRecords.scss";

interface MedicalRecordWithDetails extends MedicalRecord {
  appointment?: Appointment & {
    patient?: Patient;
  };
}

const MedicalRecords: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [view, setView] = useState<"list" | "create" | "edit" | "view">("list");
  const [medicalRecords, setMedicalRecords] = useState<
    MedicalRecordWithDetails[]
  >([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedRecord, setSelectedRecord] =
    useState<MedicalRecordWithDetails | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Search and filter state
  const [filters, setFilters] = useState({
    patientId: "",
    patientName: "",
    diagnosis: "",
    dateFrom: "",
    dateTo: "",
    doctorId: "",
    hasFollowUp: "",
    limit: 20,
  });

  // Form state for create/edit
  const [formData, setFormData] = useState({
    appointmentId: "",
    patientId: "",
    diagnosis: "",
    symptoms: "",
    prescription: "",
    treatmentPlan: "",
    followUpDate: "",
    followUpNotes: "",
    vitalSigns: "",
    labResults: "",
    imagingResults: "",
    notes: "",
  });

  useEffect(() => {
    if (view === "list") {
      fetchMedicalRecords();
    }
    fetchPatients();
    if (user?.clearanceLevel === "L3" || user?.clearanceLevel === "L4") {
      fetchDoctors();
    }
  }, [view, filters, currentPage]);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiService.searchMedicalRecords({
        ...filters,
        page: currentPage,
        limit: filters.limit,
        hasFollowUp:
          filters.hasFollowUp === ""
            ? undefined
            : filters.hasFollowUp === "true",
        patientId: filters.patientId ? parseInt(filters.patientId) : undefined,
        doctorId: filters.doctorId ? parseInt(filters.doctorId) : undefined,
      });

      setMedicalRecords(response.medicalRecords);
      setTotalPages(response.pagination.totalPages);
      setTotalRecords(response.pagination.total);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to fetch medical records"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await apiService.getPatients();
      setPatients(response.patients);
    } catch (err: any) {
      console.error("Failed to fetch patients:", err);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await apiService.getDoctors();
      setDoctors(response.doctors);
    } catch (err: any) {
      console.error("Failed to fetch doctors:", err);
    }
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      await apiService.createMedicalRecord({
        appointmentId: parseInt(formData.appointmentId),
        patientId: parseInt(formData.patientId),
        diagnosis: formData.diagnosis,
        symptoms: formData.symptoms || undefined,
        prescription: formData.prescription || undefined,
        treatmentPlan: formData.treatmentPlan || undefined,
        followUpDate: formData.followUpDate || undefined,
        followUpNotes: formData.followUpNotes || undefined,
        vitalSigns: formData.vitalSigns || undefined,
        labResults: formData.labResults || undefined,
        imagingResults: formData.imagingResults || undefined,
        notes: formData.notes || undefined,
      });

      setSuccess("Medical record created successfully!");
      setView("list");
      resetForm();
      fetchMedicalRecords();
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to create medical record"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    try {
      setLoading(true);
      setError("");

      await apiService.updateMedicalRecord(selectedRecord.id, {
        diagnosis: formData.diagnosis,
        symptoms: formData.symptoms || undefined,
        prescription: formData.prescription || undefined,
        treatmentPlan: formData.treatmentPlan || undefined,
        followUpDate: formData.followUpDate || undefined,
        followUpNotes: formData.followUpNotes || undefined,
        vitalSigns: formData.vitalSigns || undefined,
        labResults: formData.labResults || undefined,
        imagingResults: formData.imagingResults || undefined,
        notes: formData.notes || undefined,
      });

      setSuccess("Medical record updated successfully!");
      setView("list");
      resetForm();
      fetchMedicalRecords();
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to update medical record"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: MedicalRecordWithDetails) => {
    setSelectedRecord(record);
    setFormData({
      appointmentId: record.appointmentId.toString(),
      patientId: record.patientId.toString(),
      diagnosis: record.diagnosis,
      symptoms: record.symptoms || "",
      prescription: record.prescription || "",
      treatmentPlan: record.treatmentPlan || "",
      followUpDate: record.followUpDate || "",
      followUpNotes: record.followUpNotes || "",
      vitalSigns: record.vitalSigns || "",
      labResults: record.labResults || "",
      imagingResults: record.imagingResults || "",
      notes: record.notes || "",
    });
    setView("edit");
  };

  const handleView = async (record: MedicalRecordWithDetails) => {
    try {
      const response = await apiService.getMedicalRecord(record.id);
      setSelectedRecord(response.medicalRecord as MedicalRecordWithDetails);
      setView("view");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to fetch medical record details"
      );
    }
  };

  const resetForm = () => {
    setFormData({
      appointmentId: "",
      patientId: "",
      diagnosis: "",
      symptoms: "",
      prescription: "",
      treatmentPlan: "",
      followUpDate: "",
      followUpNotes: "",
      vitalSigns: "",
      labResults: "",
      imagingResults: "",
      notes: "",
    });
    setSelectedRecord(null);
  };

  const exportRecords = () => {
    const csvContent = [
      [
        "Patient",
        "Diagnosis",
        "Symptoms",
        "Prescription",
        "Treatment Plan",
        "Follow-up Date",
        "Created Date",
      ],
      ...medicalRecords.map(record => [
        record.appointment?.patient?.name || "Unknown",
        record.diagnosis,
        record.symptoms || "",
        record.prescription || "",
        record.treatmentPlan || "",
        record.followUpDate || "",
        record.createdAt,
      ]),
    ]
      .map(row => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `medical-records-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const canCreateRecords =
    user?.clearanceLevel === "L2" ||
    user?.clearanceLevel === "L3" ||
    user?.clearanceLevel === "L4";
  const canViewAllRecords =
    user?.clearanceLevel === "L3" || user?.clearanceLevel === "L4";

  if (view === "create" || view === "edit") {
    return (
      <div className="medical-records">
        <div className="container">
          <div className="page-header">
            <button
              className="btn btn--outline"
              onClick={() => {
                setView("list");
                resetForm();
              }}
            >
              <ArrowLeft size={20} />
              Back to Records
            </button>
            <h1>
              {view === "create"
                ? "Create Medical Record"
                : "Edit Medical Record"}
            </h1>
          </div>

          {error && <div className="alert alert--error">{error}</div>}

          <div className="medical-record-form-container">
            <form
              onSubmit={
                view === "create" ? handleCreateRecord : handleUpdateRecord
              }
              className="medical-record-form"
            >
              <div className="form-section">
                <h3>Basic Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="patientId">Patient *</label>
                    <select
                      id="patientId"
                      value={formData.patientId}
                      onChange={e =>
                        setFormData({ ...formData, patientId: e.target.value })
                      }
                      required
                      disabled={view === "edit"}
                    >
                      <option value="">Select Patient</option>
                      {patients.map(patient => (
                        <option key={patient.id} value={patient.id}>
                          {patient.name} ({patient.patientId})
                        </option>
                      ))}
                    </select>
                  </div>

                  {view === "create" && (
                    <div className="form-group">
                      <label htmlFor="appointmentId">Appointment ID *</label>
                      <input
                        type="number"
                        id="appointmentId"
                        value={formData.appointmentId}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            appointmentId: e.target.value,
                          })
                        }
                        required
                        placeholder="Enter appointment ID"
                      />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="diagnosis">Diagnosis *</label>
                  <textarea
                    id="diagnosis"
                    value={formData.diagnosis}
                    onChange={e =>
                      setFormData({ ...formData, diagnosis: e.target.value })
                    }
                    required
                    placeholder="Enter diagnosis"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="symptoms">Symptoms</label>
                  <textarea
                    id="symptoms"
                    value={formData.symptoms}
                    onChange={e =>
                      setFormData({ ...formData, symptoms: e.target.value })
                    }
                    placeholder="Enter symptoms"
                    rows={3}
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Treatment</h3>
                <div className="form-group">
                  <label htmlFor="prescription">Prescription</label>
                  <textarea
                    id="prescription"
                    value={formData.prescription}
                    onChange={e =>
                      setFormData({ ...formData, prescription: e.target.value })
                    }
                    placeholder="Enter prescription details"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="treatmentPlan">Treatment Plan</label>
                  <textarea
                    id="treatmentPlan"
                    value={formData.treatmentPlan}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        treatmentPlan: e.target.value,
                      })
                    }
                    placeholder="Enter treatment plan"
                    rows={3}
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Follow-up & Additional Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="followUpDate">Follow-up Date</label>
                    <input
                      type="date"
                      id="followUpDate"
                      value={formData.followUpDate}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          followUpDate: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="followUpNotes">Follow-up Notes</label>
                  <textarea
                    id="followUpNotes"
                    value={formData.followUpNotes}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        followUpNotes: e.target.value,
                      })
                    }
                    placeholder="Enter follow-up notes"
                    rows={2}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="vitalSigns">Vital Signs</label>
                  <textarea
                    id="vitalSigns"
                    value={formData.vitalSigns}
                    onChange={e =>
                      setFormData({ ...formData, vitalSigns: e.target.value })
                    }
                    placeholder="Enter vital signs"
                    rows={2}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="labResults">Lab Results</label>
                  <textarea
                    id="labResults"
                    value={formData.labResults}
                    onChange={e =>
                      setFormData({ ...formData, labResults: e.target.value })
                    }
                    placeholder="Enter lab results"
                    rows={2}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="imagingResults">Imaging Results</label>
                  <textarea
                    id="imagingResults"
                    value={formData.imagingResults}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        imagingResults: e.target.value,
                      })
                    }
                    placeholder="Enter imaging results"
                    rows={2}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Additional Notes</label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={e =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Enter additional notes"
                    rows={3}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() => setView("list")}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : view === "create"
                      ? "Create Record"
                      : "Update Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (view === "view" && selectedRecord) {
    return (
      <div className="medical-records">
        <div className="container">
          <div className="page-header">
            <button
              className="btn btn--outline"
              onClick={() => setView("list")}
            >
              <ArrowLeft size={20} />
              Back to Records
            </button>
            <h1>Medical Record Details</h1>
            {canCreateRecords && (
              <button
                className="btn btn--primary"
                onClick={() => handleEdit(selectedRecord)}
              >
                <Edit size={16} />
                Edit Record
              </button>
            )}
          </div>

          <div className="medical-record-details">
            <div className="record-header">
              <div className="patient-info">
                <h2>
                  {selectedRecord.appointment?.patient?.name ||
                    "Unknown Patient"}
                </h2>
                <p>
                  Patient ID: {selectedRecord.appointment?.patient?.patientId}
                </p>
                <p>Date: {selectedRecord.appointment?.appointmentDate}</p>
              </div>
              <div className="record-meta">
                <span className="record-id">Record #{selectedRecord.id}</span>
                <span className="record-date">
                  {new Date(selectedRecord.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="record-content">
              <div className="record-section">
                <h3>Diagnosis</h3>
                <p>{selectedRecord.diagnosis}</p>
              </div>

              {selectedRecord.symptoms && (
                <div className="record-section">
                  <h3>Symptoms</h3>
                  <p>{selectedRecord.symptoms}</p>
                </div>
              )}

              {selectedRecord.prescription && (
                <div className="record-section">
                  <h3>Prescription</h3>
                  <p>{selectedRecord.prescription}</p>
                </div>
              )}

              {selectedRecord.treatmentPlan && (
                <div className="record-section">
                  <h3>Treatment Plan</h3>
                  <p>{selectedRecord.treatmentPlan}</p>
                </div>
              )}

              {selectedRecord.followUpDate && (
                <div className="record-section">
                  <h3>Follow-up</h3>
                  <p>
                    <strong>Date:</strong> {selectedRecord.followUpDate}
                  </p>
                  {selectedRecord.followUpNotes && (
                    <p>
                      <strong>Notes:</strong> {selectedRecord.followUpNotes}
                    </p>
                  )}
                </div>
              )}

              {selectedRecord.vitalSigns && (
                <div className="record-section">
                  <h3>Vital Signs</h3>
                  <p>{selectedRecord.vitalSigns}</p>
                </div>
              )}

              {selectedRecord.labResults && (
                <div className="record-section">
                  <h3>Lab Results</h3>
                  <p>{selectedRecord.labResults}</p>
                </div>
              )}

              {selectedRecord.imagingResults && (
                <div className="record-section">
                  <h3>Imaging Results</h3>
                  <p>{selectedRecord.imagingResults}</p>
                </div>
              )}

              {selectedRecord.notes && (
                <div className="record-section">
                  <h3>Additional Notes</h3>
                  <p>{selectedRecord.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="medical-records">
      <div className="container">
        <div className="page-header">
          <button
            className="btn btn--outline"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <h1>Medical Records</h1>
          <div className="header-actions">
            {canCreateRecords && (
              <button
                className="btn btn--primary"
                onClick={() => setView("create")}
              >
                <Plus size={16} />
                Create Record
              </button>
            )}
            <button className="btn btn--secondary" onClick={exportRecords}>
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        {error && <div className="alert alert--error">{error}</div>}
        {success && <div className="alert alert--success">{success}</div>}

        <div className="search-filters">
          <div className="filters-row">
            <div className="form-group">
              <label>Patient Name</label>
              <input
                type="text"
                value={filters.patientName}
                onChange={e =>
                  setFilters({ ...filters, patientName: e.target.value })
                }
                placeholder="Search by patient name"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Diagnosis</label>
              <input
                type="text"
                value={filters.diagnosis}
                onChange={e =>
                  setFilters({ ...filters, diagnosis: e.target.value })
                }
                placeholder="Search by diagnosis"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={e =>
                  setFilters({ ...filters, dateFrom: e.target.value })
                }
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={e =>
                  setFilters({ ...filters, dateTo: e.target.value })
                }
                className="form-control"
              />
            </div>

            {canViewAllRecords && (
              <div className="form-group">
                <label>Doctor</label>
                <select
                  value={filters.doctorId}
                  onChange={e =>
                    setFilters({ ...filters, doctorId: e.target.value })
                  }
                  className="form-control"
                >
                  <option value="">All Doctors</option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label>Follow-up Status</label>
              <select
                value={filters.hasFollowUp}
                onChange={e =>
                  setFilters({ ...filters, hasFollowUp: e.target.value })
                }
                className="form-control"
              >
                <option value="">All Records</option>
                <option value="true">Has Follow-up</option>
                <option value="false">No Follow-up</option>
              </select>
            </div>

            <div className="form-group">
              <label>Records per page</label>
              <select
                value={filters.limit}
                onChange={e =>
                  setFilters({ ...filters, limit: parseInt(e.target.value) })
                }
                className="form-control"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="filters-actions">
            <button
              className="btn btn--outline"
              onClick={() => {
                setFilters({
                  patientId: "",
                  patientName: "",
                  diagnosis: "",
                  dateFrom: "",
                  dateTo: "",
                  doctorId: "",
                  hasFollowUp: "",
                  limit: 20,
                });
                setCurrentPage(1);
              }}
            >
              Clear Filters
            </button>
            <button
              className="btn btn--primary"
              onClick={() => {
                setCurrentPage(1);
                fetchMedicalRecords();
              }}
            >
              <Search size={16} />
              Search
            </button>
          </div>
        </div>

        <div className="records-container">
          {loading ? (
            <div className="loading">Loading medical records...</div>
          ) : medicalRecords.length === 0 ? (
            <div className="no-records">
              <FileText size={48} />
              <h3>No medical records found</h3>
              <p>Try adjusting your search criteria or create a new record.</p>
            </div>
          ) : (
            <>
              <div className="records-summary">
                <p>
                  Showing {medicalRecords.length} of {totalRecords} records
                </p>
              </div>

              <div className="records-list">
                {medicalRecords.map(record => (
                  <div key={record.id} className="record-card">
                    <div className="record-header">
                      <div className="record-patient">
                        <User size={16} />
                        <div>
                          <h4>
                            {record.appointment?.patient?.name ||
                              "Unknown Patient"}
                          </h4>
                          <p>ID: {record.appointment?.patient?.patientId}</p>
                        </div>
                      </div>
                      <div className="record-actions">
                        <button
                          className="btn btn--outline btn--sm"
                          onClick={() => handleView(record)}
                        >
                          <Eye size={14} />
                          View
                        </button>
                        {canCreateRecords && (
                          <button
                            className="btn btn--outline btn--sm"
                            onClick={() => handleEdit(record)}
                          >
                            <Edit size={14} />
                            Edit
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="record-content">
                      <div className="record-diagnosis">
                        <Stethoscope size={14} />
                        <strong>Diagnosis:</strong> {record.diagnosis}
                      </div>

                      {record.symptoms && (
                        <div className="record-symptoms">
                          <Activity size={14} />
                          <strong>Symptoms:</strong>{" "}
                          {record.symptoms.substring(0, 100)}
                          {record.symptoms.length > 100 && "..."}
                        </div>
                      )}

                      {record.prescription && (
                        <div className="record-prescription">
                          <Pill size={14} />
                          <strong>Prescription:</strong>{" "}
                          {record.prescription.substring(0, 100)}
                          {record.prescription.length > 100 && "..."}
                        </div>
                      )}

                      <div className="record-meta">
                        <span className="record-date">
                          <Calendar size={12} />
                          {new Date(record.createdAt).toLocaleDateString()}
                        </span>
                        {record.followUpDate && (
                          <span className="record-followup">
                            Follow-up: {record.followUpDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="btn btn--outline"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span className="page-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="btn btn--outline"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalRecords;
