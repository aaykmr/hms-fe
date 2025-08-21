import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import PatientRegistration from './components/PatientRegistration';
import AppointmentManagement from './components/AppointmentManagement';
import MedicalRecords from './components/MedicalRecords';
import './styles/main.scss';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredClearance?: 'L1' | 'L2' | 'L3' | 'L4' }> = ({ 
  children, 
  requiredClearance 
}) => {
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

// Main App Component
const AppContent: React.FC = () => {
  return (
    <Router>
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
          path="/medical-records" 
          element={
            <ProtectedRoute requiredClearance="L2">
              <MedicalRecords />
            </ProtectedRoute>
          } 
        />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

// Root App Component
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
