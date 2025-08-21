import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import apiService from "../services/api";
import "../styles/components/PatientRegistration.scss";

const schema = yup.object({
  phoneNumber: yup.string().required("Phone number is required"),
  name: yup.string().required("Name is required"),
  dateOfBirth: yup.string().optional(),
  gender: yup
    .string()
    .oneOf(["male", "female", "other"], "Invalid gender")
    .optional(),
  address: yup.string().optional(),
  emergencyContact: yup.string().optional(),
  emergencyContactPhone: yup.string().optional(),
  bloodGroup: yup.string().optional(),
  allergies: yup.string().optional(),
  medicalHistory: yup.string().optional(),
});

const PatientRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiService.registerPatient(data);
      setSuccess(
        `Patient registered successfully! Patient ID: ${response.patient.patientId}`
      );
      reset();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to register patient. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="patient-registration">
      <div className="container">
        <div className="page-header">
          <button
            onClick={() => navigate("/dashboard")}
            className="btn btn--outline"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <h1>Patient Registration</h1>
        </div>

        {error && <div className="alert alert--error">{error}</div>}

        {success && <div className="alert alert--success">{success}</div>}

        <div className="registration-form-container">
          <form onSubmit={handleSubmit(onSubmit)} className="registration-form">
            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phoneNumber">Phone Number *</label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    {...register("phoneNumber")}
                    placeholder="Enter phone number"
                    className={errors.phoneNumber ? "error" : ""}
                  />
                  {errors.phoneNumber && (
                    <span className="error-message">
                      {errors.phoneNumber.message}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    id="name"
                    type="text"
                    {...register("name")}
                    placeholder="Enter full name"
                    className={errors.name ? "error" : ""}
                  />
                  {errors.name && (
                    <span className="error-message">{errors.name.message}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dateOfBirth">Date of Birth</label>
                  <input
                    id="dateOfBirth"
                    type="date"
                    {...register("dateOfBirth")}
                    className={errors.dateOfBirth ? "error" : ""}
                  />
                  {errors.dateOfBirth && (
                    <span className="error-message">
                      {errors.dateOfBirth.message}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="gender">Gender</label>
                  <select
                    id="gender"
                    {...register("gender")}
                    className={errors.gender ? "error" : ""}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && (
                    <span className="error-message">
                      {errors.gender.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  {...register("address")}
                  placeholder="Enter address"
                  rows={3}
                  className={errors.address ? "error" : ""}
                />
                {errors.address && (
                  <span className="error-message">
                    {errors.address.message}
                  </span>
                )}
              </div>
            </div>

            <div className="form-section">
              <h3>Emergency Contact</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="emergencyContact">
                    Emergency Contact Name
                  </label>
                  <input
                    id="emergencyContact"
                    type="text"
                    {...register("emergencyContact")}
                    placeholder="Enter emergency contact name"
                    className={errors.emergencyContact ? "error" : ""}
                  />
                  {errors.emergencyContact && (
                    <span className="error-message">
                      {errors.emergencyContact.message}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="emergencyContactPhone">
                    Emergency Contact Phone
                  </label>
                  <input
                    id="emergencyContactPhone"
                    type="tel"
                    {...register("emergencyContactPhone")}
                    placeholder="Enter emergency contact phone"
                    className={errors.emergencyContactPhone ? "error" : ""}
                  />
                  {errors.emergencyContactPhone && (
                    <span className="error-message">
                      {errors.emergencyContactPhone.message}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Medical Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="bloodGroup">Blood Group</label>
                  <select
                    id="bloodGroup"
                    {...register("bloodGroup")}
                    className={errors.bloodGroup ? "error" : ""}
                  >
                    <option value="">Select blood group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                  {errors.bloodGroup && (
                    <span className="error-message">
                      {errors.bloodGroup.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="allergies">Allergies</label>
                <textarea
                  id="allergies"
                  {...register("allergies")}
                  placeholder="Enter any known allergies"
                  rows={3}
                  className={errors.allergies ? "error" : ""}
                />
                {errors.allergies && (
                  <span className="error-message">
                    {errors.allergies.message}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="medicalHistory">Medical History</label>
                <textarea
                  id="medicalHistory"
                  {...register("medicalHistory")}
                  placeholder="Enter relevant medical history"
                  rows={4}
                  className={errors.medicalHistory ? "error" : ""}
                />
                {errors.medicalHistory && (
                  <span className="error-message">
                    {errors.medicalHistory.message}
                  </span>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="btn btn--secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={isLoading}
              >
                {isLoading ? "Registering..." : "Register Patient"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PatientRegistration;
