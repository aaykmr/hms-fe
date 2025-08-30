import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import apiService from "../services/api";
import "../styles/components/DoctorAppointments.scss";

interface Appointment {
  id: number;
  appointmentNumber: string;
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  appointmentTime: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show";
  reason?: string;
  notes?: string;
  patient?: {
    id: number;
    patientId: string;
    name: string;
    phoneNumber: string;
    dateOfBirth?: string;
    gender?: string;
  };
  createdAt: string;
}

const DoctorAppointments: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    return new Date(now.setDate(diff));
  });
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const startDate = currentWeekStart.toISOString().split("T")[0];
      const response = await apiService.getDoctorAppointmentsByWeek(startDate);
      setAppointments(response.appointments);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to load appointments. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [currentWeekStart]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const updateAppointmentStatus = async (
    appointmentId: number,
    status: string,
    notes?: string
  ) => {
    try {
      setUpdatingStatus(appointmentId);
      await apiService.updateAppointmentStatus(appointmentId, {
        status,
        notes,
      });
      // Refresh appointments after update
      await fetchAppointments();
      // Update selected appointment if it's the one being updated
      if (selectedAppointment?.id === appointmentId) {
        const updatedAppointment = appointments.find(
          a => a.id === appointmentId
        );
        if (updatedAppointment) {
          setSelectedAppointment(updatedAppointment);
        }
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to update appointment status."
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={16} className="status-icon completed" />;
      case "cancelled":
        return <XCircle size={16} className="status-icon cancelled" />;
      case "no_show":
        return <XCircle size={16} className="status-icon no-show" />;
      case "in_progress":
        return <AlertCircle size={16} className="status-icon in-progress" />;
      default:
        return <Clock size={16} className="status-icon scheduled" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "completed";
      case "cancelled":
        return "cancelled";
      case "no_show":
        return "no-show";
      case "in_progress":
        return "in-progress";
      default:
        return "scheduled";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const getAppointmentsForDay = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return appointments.filter(
      appointment => appointment.appointmentDate === dateStr
    );
  };

  const goToPreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  const goToCurrentWeek = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    setCurrentWeekStart(new Date(now.setDate(diff)));
  };

  // Calculate if current time should be shown and its position
  const getCurrentTimePosition = () => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Check if current time is within the displayed week
    const weekStart = new Date(currentWeekStart);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    // Compare only the date parts, not the full datetime
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStartDate = new Date(
      weekStart.getFullYear(),
      weekStart.getMonth(),
      weekStart.getDate()
    );
    const weekEndDate = new Date(
      weekEnd.getFullYear(),
      weekEnd.getMonth(),
      weekEnd.getDate()
    );

    console.log("Date comparison debug:", {
      nowDate: nowDate.toDateString(),
      weekStartDate: weekStartDate.toDateString(),
      weekEndDate: weekEndDate.toDateString(),
      isInWeek: nowDate >= weekStartDate && nowDate <= weekEndDate,
    });

    if (nowDate >= weekStartDate && nowDate <= weekEndDate) {
      // Calculate position: (hour + minute/60) * 60px (height of each time slot)
      // Show at actual current time position, even if outside business hours
      let position = (currentHour + currentMinute / 60) * 60;

      // If current time is before 9 AM, show at actual time position (but ensure it's visible)
      if (currentHour < 9) {
        // Keep actual position, but ensure it's not too high up (minimum at 12 AM)
        position = Math.max(0, position);
      }
      // If current time is after 5 PM, show at actual time position (but ensure it's visible)
      else if (currentHour >= 17) {
        // Keep actual position, but ensure it's not too low down (maximum at 11 PM)
        position = Math.min(23 * 60, position);
      }

      // Ensure position is within the full 24-hour range (0 to 23 hours = 0 to 1380px)
      position = Math.max(0, Math.min(23 * 60, position));

      console.log("Current time debug:", {
        currentHour,
        currentMinute,
        position,
        actualPosition: (currentHour + currentMinute / 60) * 60,
        show: true,
      });

      return {
        show: true,
        position,
        dayIndex: currentDay === 0 ? 6 : currentDay - 1, // Convert Sunday=0 to Sunday=6 for our grid
        time: `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`,
      } as const;
    }

    console.log("Current time debug: not in current week");
    return { show: false } as const;
  };

  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  if (loading) {
    return (
      <div className="doctor-appointments">
        <div className="container">
          <div className="loading">Loading appointments...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-appointments">
      <div className="container">
        <div className="page-header">
          <button
            onClick={() => navigate("/dashboard")}
            className="btn btn--outline"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <h1>My Appointments</h1>
        </div>

        {error && <div className="alert alert--error">{error}</div>}

        <div className="calendar-container">
          <div className="calendar-header">
            <div className="calendar-navigation">
              <button onClick={goToPreviousWeek} className="btn btn--outline">
                <ChevronLeft size={16} />
                Previous Week
              </button>
              <button onClick={goToCurrentWeek} className="btn btn--outline">
                Today
              </button>
              <button onClick={goToNextWeek} className="btn btn--outline">
                Next Week
                <ChevronLeft
                  size={16}
                  style={{ transform: "rotate(180deg)" }}
                />
              </button>
            </div>
            <div className="calendar-title">
              {currentWeekStart.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>

          <div className="calendar-layout">
            <div className="calendar-week">
              <div className="calendar-time-header">
                <div className="time-header-cell">Time</div>
                {getWeekDays().map((date, index) => (
                  <div
                    key={index}
                    className={`date-header-cell ${isToday(date) ? "today" : ""}`}
                  >
                    <div className="date-day">
                      {date.toLocaleDateString("en-US", { weekday: "short" })}
                    </div>
                    <div className="date-number">{date.getDate()}</div>
                  </div>
                ))}
              </div>

              <div className="calendar-time-slots">
                {Array.from({ length: 24 }, (_, hour) => (
                  <div key={hour} className="time-slot-row">
                    <div className="time-label">
                      {hour === 0
                        ? "12 AM"
                        : hour < 12
                          ? `${hour} AM`
                          : hour === 12
                            ? "12 PM"
                            : `${hour - 12} PM`}
                    </div>
                    {getWeekDays().map((date, dayIndex) => {
                      const dayAppointments = getAppointmentsForDay(date);
                      const hourAppointments = dayAppointments.filter(
                        appointment =>
                          parseInt(
                            appointment.appointmentTime.split(":")[0]
                          ) === hour
                      );

                      return (
                        <div
                          key={dayIndex}
                          className={`time-slot-cell ${isToday(date) ? "today" : ""}`}
                        >
                          {hourAppointments.map(appointment => (
                            <div
                              key={appointment.id}
                              className={`appointment-slot ${getStatusColor(appointment.status)} ${
                                selectedAppointment?.id === appointment.id
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() =>
                                setSelectedAppointment(appointment)
                              }
                            >
                              <div className="appointment-time">
                                {appointment.appointmentTime}
                              </div>
                              <div className="appointment-patient">
                                {appointment.patient?.name}
                              </div>
                              <div className="appointment-status">
                                {getStatusIcon(appointment.status)}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}

                {/* Current time indicator */}
                {(() => {
                  const currentTimeInfo = getCurrentTimePosition();
                  console.log(
                    "Rendering current time indicator:",
                    currentTimeInfo
                  );

                  if (currentTimeInfo.show) {
                    const now = new Date();
                    const currentHour = now.getHours();
                    const isOutsideBusinessHours =
                      currentHour < 9 || currentHour >= 17;

                    console.log("Current time indicator details:", {
                      position: currentTimeInfo.position,
                      time: currentTimeInfo.time,
                      isOutsideBusinessHours,
                    });

                    return (
                      <div
                        className={`current-time-indicator`}
                        style={{
                          top: `${currentTimeInfo.position}px`,
                        }}
                      >
                        <div className="current-time-label">
                          {currentTimeInfo.time}
                        </div>
                        <div className="current-time-dot"></div>
                        <div className="current-time-line"></div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>

            <div className="appointment-details-panel">
              {selectedAppointment ? (
                <div className="appointment-details">
                  <div className="details-header">
                    <h3>Appointment Details</h3>
                    <button
                      onClick={() => setSelectedAppointment(null)}
                      className="btn btn--outline btn--small"
                    >
                      ×
                    </button>
                  </div>

                  <div className="appointment-card">
                    <div className="appointment-header">
                      <div className="appointment-number">
                        #{selectedAppointment.appointmentNumber}
                      </div>
                      <div
                        className={`status-badge ${getStatusColor(selectedAppointment.status)}`}
                      >
                        {getStatusIcon(selectedAppointment.status)}
                        {selectedAppointment.status
                          .replace("_", " ")
                          .toUpperCase()}
                      </div>
                    </div>

                    <div className="appointment-details">
                      <div className="patient-info">
                        <User size={16} />
                        <div>
                          <strong>{selectedAppointment.patient?.name}</strong>
                          <span>
                            ID: {selectedAppointment.patient?.patientId}
                          </span>
                          <span>
                            Phone: {selectedAppointment.patient?.phoneNumber}
                          </span>
                        </div>
                      </div>

                      <div className="appointment-time">
                        <Calendar size={16} />
                        <div>
                          <strong>
                            {formatDate(selectedAppointment.appointmentDate)}
                          </strong>
                          <span>
                            Time:{" "}
                            {formatTime(selectedAppointment.appointmentTime)}
                          </span>
                        </div>
                      </div>

                      {selectedAppointment.reason && (
                        <div className="appointment-reason">
                          <strong>Reason:</strong> {selectedAppointment.reason}
                        </div>
                      )}

                      {selectedAppointment.notes && (
                        <div className="appointment-notes">
                          <strong>Notes:</strong> {selectedAppointment.notes}
                        </div>
                      )}
                    </div>

                    <div className="appointment-actions">
                      {selectedAppointment.status === "scheduled" && (
                        <>
                          <button
                            onClick={() =>
                              updateAppointmentStatus(
                                selectedAppointment.id,
                                "in_progress"
                              )
                            }
                            className="btn btn--primary"
                            disabled={updatingStatus === selectedAppointment.id}
                          >
                            {updatingStatus === selectedAppointment.id
                              ? "Starting..."
                              : "Start Appointment"}
                          </button>
                          <button
                            onClick={() =>
                              updateAppointmentStatus(
                                selectedAppointment.id,
                                "cancelled"
                              )
                            }
                            className="btn btn--outline"
                            disabled={updatingStatus === selectedAppointment.id}
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {selectedAppointment.status === "in_progress" && (
                        <button
                          onClick={() =>
                            updateAppointmentStatus(
                              selectedAppointment.id,
                              "completed"
                            )
                          }
                          className="btn btn--success"
                          disabled={updatingStatus === selectedAppointment.id}
                        >
                          {updatingStatus === selectedAppointment.id
                            ? "Completing..."
                            : "Complete Appointment"}
                        </button>
                      )}

                      {selectedAppointment.status === "scheduled" && (
                        <button
                          onClick={() =>
                            updateAppointmentStatus(
                              selectedAppointment.id,
                              "no_show"
                            )
                          }
                          className="btn btn--warning"
                          disabled={updatingStatus === selectedAppointment.id}
                        >
                          Mark as No Show
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-selection">
                  <Calendar size={48} />
                  <h3>No Appointment Selected</h3>
                  <p>Click on an appointment in the calendar to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointments;
