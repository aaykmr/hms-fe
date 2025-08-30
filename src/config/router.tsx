import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Login from "../components/Login";
import Signup from "../components/Signup";
import Dashboard from "../components/Dashboard";
import PatientRegistration from "../components/PatientRegistration";
import AppointmentManagement from "../components/AppointmentManagement";
import DoctorAppointments from "../components/DoctorAppointments";
import MedicalRecords from "../components/MedicalRecords";
import UserManagement from "../components/UserManagement";
import ActivityLogs from "../components/ActivityLogs";
import PatientMonitoring from "../components/PatientMonitoring";

// Protected Route Component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requiredClearance?: "L1" | "L2" | "L3" | "L4";
}> = ({ children, requiredClearance }) => {
  const { isAuthenticated, loading, hasClearance } = useAuth();

  if (loading) {
    return (
      <div className="spinner">
        <div className="spinner__element"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredClearance && !hasClearance(requiredClearance)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// App Routes Component
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patients/register"
        element={
          <ProtectedRoute requiredClearance="L1">
            <PatientRegistration />
          </ProtectedRoute>
        }
      />

      <Route
        path="/appointments"
        element={
          <ProtectedRoute requiredClearance="L1">
            <AppointmentManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/appointments/doctor"
        element={
          <ProtectedRoute requiredClearance="L2">
            <DoctorAppointments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/medical-records"
        element={
          <ProtectedRoute requiredClearance="L2">
            <MedicalRecords />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute requiredClearance="L3">
            <UserManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/activity-logs"
        element={
          <ProtectedRoute requiredClearance="L3">
            <ActivityLogs />
          </ProtectedRoute>
        }
      />

      <Route
        path="/monitoring"
        element={
          <ProtectedRoute requiredClearance="L2">
            <PatientMonitoring />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
