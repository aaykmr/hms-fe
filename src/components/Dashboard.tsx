import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { DashboardStats } from "../services/api";
import apiService from "../services/api";
import { User, Calendar, Users, FileText, LogOut } from "lucide-react";
import "../styles/components/Dashboard.scss";

const Dashboard: React.FC = () => {
  const { user, logout, hasClearance } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        if (hasClearance("L2")) {
          const { dashboard } = await apiService.getDoctorDashboard();
          setStats(dashboard);
        }
      } catch (error) {
        console.error("Failed to load dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardStats();
  }, [hasClearance]);

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    {
      title: "Patient Registration",
      icon: <Users size={24} />,
      path: "/patients/register",
      clearance: "L1" as const,
      description: "Register new patients",
    },
    {
      title: "Appointments",
      icon: <Calendar size={24} />,
      path: "/appointments",
      clearance: "L1" as const,
      description: "Manage appointments",
    },
    {
      title: "Medical Records",
      icon: <FileText size={24} />,
      path: "/medical-records",
      clearance: "L2" as const,
      description: "View and manage medical records",
    },
  ];

  const filteredMenuItems = menuItems.filter(item =>
    hasClearance(item.clearance)
  );

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="container">
          <div className="dashboard-header__content">
            <div className="dashboard-header__title">
              <h1>Hospital Management System</h1>
              <p>Welcome back, {user?.name}</p>
            </div>
            <div className="dashboard-header__user">
              <div className="user-info">
                <span className="user-name">{user?.name}</span>
                <span className="user-role">Level {user?.clearanceLevel}</span>
                {user?.department && (
                  <span className="user-dept">{user.department}</span>
                )}
              </div>
              <button onClick={handleLogout} className="btn btn--outline">
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="container">
          {hasClearance("L2") && stats && (
            <section className="dashboard-stats">
              <h2>Today`s Overview</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-card__icon">
                    <Calendar size={24} />
                  </div>
                  <div className="stat-card__content">
                    <h3>{stats.todayAppointments}</h3>
                    <p>Today`s Appointments</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-card__icon">
                    <Users size={24} />
                  </div>
                  <div className="stat-card__content">
                    <h3>{stats.completedToday}</h3>
                    <p>Completed Today</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-card__icon">
                    <FileText size={24} />
                  </div>
                  <div className="stat-card__content">
                    <h3>{stats.totalThisMonth}</h3>
                    <p>This Month</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-card__icon">
                    <User size={24} />
                  </div>
                  <div className="stat-card__content">
                    <h3>{stats.completionRate}%</h3>
                    <p>Completion Rate</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="dashboard-menu">
            <h2>Quick Actions</h2>
            <div className="menu-grid">
              {filteredMenuItems.map(item => (
                <div
                  key={item.path}
                  className="menu-card"
                  onClick={() => navigate(item.path)}
                >
                  <div className="menu-card__icon">{item.icon}</div>
                  <div className="menu-card__content">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
