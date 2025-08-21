import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, User, Stethoscope } from "lucide-react";
import apiService from "../services/api";
import "../styles/components/AppointmentManagement.scss";

const schema = yup.object({
  patientId: yup.string().required("Patient is required"),
  doctorId: yup.string().required("Doctor is required"),
  appointmentDate: yup.string().required("Appointment date is required"),
  appointmentTime: yup.string().required("Appointment time is required"),
  reason: yup.string().optional(),
});

interface Patient {
  id: number;
  patientId: string;
  name: string;
  phoneNumber: string;
}

interface Doctor {
  id: number;
  staffId: string;
  name: string;
  department?: string;
}

const AppointmentManagement: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        // Fetch patients and doctors
        const [patientsResponse, doctorsResponse] = await Promise.all([
          apiService.getPatients(),
          apiService.getDoctors(),
        ]);
        setPatients(patientsResponse.patients || []);
        setDoctors(doctorsResponse.doctors || []);
      } catch (err: any) {
        setError("Failed to load data. Please try again.");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiService.createAppointment({
        patientId: parseInt(data.patientId),
        doctorId: parseInt(data.doctorId),
        appointmentDate: data.appointmentDate,
        appointmentTime: data.appointmentTime,
        reason: data.reason,
      });
      setSuccess(
        `Appointment created successfully! Appointment Number: ${response.appointment.appointmentNumber}`
      );
      reset();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to create appointment. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
  ];

  if (loadingData) {
    return (
      <div className="appointment-management">
        <div className="container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="appointment-management">
      <div className="container">
        <div className="page-header">
          <button
            onClick={() => navigate("/dashboard")}
            className="btn btn--outline"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <h1>Create Appointment</h1>
        </div>

        {error && <div className="alert alert--error">{error}</div>}
        {success && <div className="alert alert--success">{success}</div>}

        <div className="appointment-form-container">
          <form onSubmit={handleSubmit(onSubmit)} className="appointment-form">
            <div className="form-section">
              <h3>
                <User size={20} />
                Patient Information
              </h3>
              <div className="form-group">
                <label htmlFor="patientId">Select Patient *</label>
                <select
                  id="patientId"
                  {...register("patientId")}
                  className={errors.patientId ? "error" : ""}
                >
                  <option value="">Choose a patient...</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.patientId} - {patient.name} (
                      {patient.phoneNumber})
                    </option>
                  ))}
                </select>
                {errors.patientId && (
                  <span className="error-message">
                    {errors.patientId.message}
                  </span>
                )}
              </div>
            </div>

            <div className="form-section">
              <h3>
                <Stethoscope size={20} />
                Doctor Information
              </h3>
              <div className="form-group">
                <label htmlFor="doctorId">Select Doctor *</label>
                <select
                  id="doctorId"
                  {...register("doctorId")}
                  className={errors.doctorId ? "error" : ""}
                >
                  <option value="">Choose a doctor...</option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.staffId} - Dr. {doctor.name} ({doctor.department})
                    </option>
                  ))}
                </select>
                {errors.doctorId && (
                  <span className="error-message">
                    {errors.doctorId.message}
                  </span>
                )}
              </div>
            </div>

            <div className="form-section">
              <h3>
                <Calendar size={20} />
                Appointment Details
              </h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="appointmentDate">Appointment Date *</label>
                  <input
                    id="appointmentDate"
                    type="date"
                    {...register("appointmentDate")}
                    className={errors.appointmentDate ? "error" : ""}
                    min={new Date().toISOString().split("T")[0]}
                  />
                  {errors.appointmentDate && (
                    <span className="error-message">
                      {errors.appointmentDate.message}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="appointmentTime">Appointment Time *</label>
                  <select
                    id="appointmentTime"
                    {...register("appointmentTime")}
                    className={errors.appointmentTime ? "error" : ""}
                  >
                    <option value="">Choose time...</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                  {errors.appointmentTime && (
                    <span className="error-message">
                      {errors.appointmentTime.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reason">Reason for Visit</label>
                <textarea
                  id="reason"
                  {...register("reason")}
                  placeholder="Enter the reason for the appointment..."
                  rows={3}
                />
              </div>
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? "Creating Appointment..." : "Create Appointment"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AppointmentManagement;
