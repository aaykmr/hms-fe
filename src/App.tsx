import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AppRoutes from "./config/router";
import "./styles/main.scss";

// Main App Component
const AppContent: React.FC = () => {
  return (
    <Router>
      <AppRoutes />
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
