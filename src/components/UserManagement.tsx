import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User as UserIcon,
  Shield,
  Edit,
  Check,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import apiService, { User } from "../services/api";
import "../styles/components/UserManagement.scss";

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const { hasClearance } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [updatingClearance, setUpdatingClearance] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (!hasClearance("L3")) {
      navigate("/dashboard");
      return;
    }

    fetchUsers();
  }, [hasClearance, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiService.getAllUsers();
      setUsers(response.users);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to load users. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClearance = async (
    userId: number,
    newClearanceLevel: "L1" | "L2" | "L3" | "L4"
  ) => {
    try {
      setUpdatingClearance(userId);
      setError("");
      setSuccess("");

      await apiService.updateUserClearance(userId, newClearanceLevel);

      // Update the user in the local state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId
            ? { ...user, clearanceLevel: newClearanceLevel }
            : user
        )
      );

      setSuccess("User clearance level updated successfully");
      setEditingUser(null);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to update user clearance level."
      );
    } finally {
      setUpdatingClearance(null);
    }
  };

  const getClearanceLevelLabel = (level: string) => {
    switch (level) {
      case "L1":
        return "Basic Access";
      case "L2":
        return "Doctor Access";
      case "L3":
        return "Senior Doctor";
      case "L4":
        return "Administrator";
      default:
        return level;
    }
  };

  const getClearanceLevelColor = (level: string) => {
    switch (level) {
      case "L1":
        return "basic";
      case "L2":
        return "doctor";
      case "L3":
        return "senior";
      case "L4":
        return "admin";
      default:
        return "basic";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!hasClearance("L3")) {
    return null;
  }

  if (loading) {
    return (
      <div className="user-management">
        <div className="container">
          <div className="loading">Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="container">
        <div className="page-header">
          <button
            onClick={() => navigate("/dashboard")}
            className="btn btn--outline"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <h1>User Management</h1>
        </div>

        {error && <div className="alert alert--error">{error}</div>}
        {success && <div className="alert alert--success">{success}</div>}

        <div className="users-container">
          <div className="users-header">
            <h2>All Users</h2>
            <p>Manage user clearance levels and permissions</p>
          </div>

          <div className="users-list">
            {users.map(user => (
              <div key={user.id} className="user-card">
                <div className="user-info">
                  <div className="user-avatar">
                    <UserIcon size={24} />
                  </div>
                  <div className="user-details">
                    <h3>{user.name}</h3>
                    <div className="user-meta">
                      <span className="staff-id">{user.staffId}</span>
                      <span className="email">{user.email}</span>
                      {user.department && (
                        <span className="department">{user.department}</span>
                      )}
                    </div>
                    <div className="user-timestamps">
                      <span>
                        Created:{" "}
                        {user.createdAt ? formatDate(user.createdAt) : "N/A"}
                      </span>
                      {user.lastLogin && (
                        <span>Last Login: {formatDate(user.lastLogin)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="user-clearance">
                  <div className="clearance-display">
                    <Shield size={16} />
                    <span
                      className={`clearance-level ${getClearanceLevelColor(user.clearanceLevel)}`}
                    >
                      {user.clearanceLevel} -{" "}
                      {getClearanceLevelLabel(user.clearanceLevel)}
                    </span>
                  </div>

                  {editingUser === user.id ? (
                    <div className="clearance-edit">
                      <select
                        className="clearance-select"
                        defaultValue={user.clearanceLevel}
                        onChange={e => {
                          const newLevel = e.target.value as
                            | "L1"
                            | "L2"
                            | "L3"
                            | "L4";
                          handleUpdateClearance(user.id, newLevel);
                        }}
                        disabled={updatingClearance === user.id}
                      >
                        <option value="L1">L1 - Basic Access</option>
                        <option value="L2">L2 - Doctor Access</option>
                        <option value="L3">L3 - Senior Doctor</option>
                        <option value="L4">L4 - Administrator</option>
                      </select>
                      <div className="edit-actions">
                        <button
                          className="btn btn--success btn--sm"
                          onClick={() => setEditingUser(null)}
                          disabled={updatingClearance === user.id}
                        >
                          <Check size={14} />
                        </button>
                        <button
                          className="btn btn--outline btn--sm"
                          onClick={() => setEditingUser(null)}
                          disabled={updatingClearance === user.id}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="btn btn--outline btn--sm"
                      onClick={() => setEditingUser(user.id)}
                      disabled={updatingClearance === user.id}
                    >
                      <Edit size={14} />
                      Change Level
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
