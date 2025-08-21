import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const AppointmentManagement: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="appointment-management">
      <div className="container">
        <div className="page-header">
          <button onClick={() => navigate('/dashboard')} className="btn btn--outline">
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <h1>Appointment Management</h1>
        </div>

        <div className="card">
          <div className="card__header">
            <h2>Appointments</h2>
          </div>
          <div className="card__body">
            <p>Appointment management functionality will be implemented here.</p>
            <p>This will include:</p>
            <ul>
              <li>View all appointments</li>
              <li>Create new appointments</li>
              <li>Update appointment status</li>
              <li>Filter appointments by date and status</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentManagement;
