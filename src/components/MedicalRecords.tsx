import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const MedicalRecords: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="medical-records">
      <div className="container">
        <div className="page-header">
          <button
            onClick={() => navigate("/dashboard")}
            className="btn btn--outline"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <h1>Medical Records</h1>
        </div>

        <div className="card">
          <div className="card__header">
            <h2>Medical Records</h2>
          </div>
          <div className="card__body">
            <p>Medical records functionality will be implemented here.</p>
            <p>This will include:</p>
            <ul>
              <li>View patient medical history</li>
              <li>Create new medical records</li>
              <li>Add diagnosis and prescriptions</li>
              <li>Update medical records</li>
              <li>Search and filter records</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalRecords;
