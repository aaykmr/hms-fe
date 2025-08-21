import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/components/Signup.scss";

const schema = yup.object({
  staffId: yup.string().required("Staff ID is required"),
  name: yup.string().required("Name is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
  clearanceLevel: yup
    .string()
    .oneOf(["L1", "L2", "L3", "L4"], "Invalid clearance level")
    .required("Clearance level is required"),
  department: yup.string().optional(),
});

const Signup: React.FC = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError("");

    try {
      await signup({
        staffId: data.staffId,
        name: data.name,
        email: data.email,
        password: data.password,
        clearanceLevel: data.clearanceLevel as "L1" | "L2" | "L3" | "L4",
        department: data.department,
      });
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Signup failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h1>Create Account</h1>
          <p>Join the Hospital Management System</p>
        </div>

        {error && <div className="alert alert--error">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="signup-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="staffId">Staff ID</label>
              <input
                id="staffId"
                type="text"
                {...register("staffId")}
                placeholder="Enter staff ID"
                className={errors.staffId ? "error" : ""}
              />
              {errors.staffId && (
                <span className="error-message">{errors.staffId.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="name">Full Name</label>
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

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              {...register("email")}
              placeholder="Enter email address"
              className={errors.email ? "error" : ""}
            />
            {errors.email && (
              <span className="error-message">{errors.email.message}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                {...register("password")}
                placeholder="Enter password"
                className={errors.password ? "error" : ""}
              />
              {errors.password && (
                <span className="error-message">{errors.password.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                placeholder="Confirm password"
                className={errors.confirmPassword ? "error" : ""}
              />
              {errors.confirmPassword && (
                <span className="error-message">
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="clearanceLevel">Clearance Level</label>
              <select
                id="clearanceLevel"
                {...register("clearanceLevel")}
                className={errors.clearanceLevel ? "error" : ""}
              >
                <option value="">Select clearance level</option>
                <option value="L1">L1 - Basic Access</option>
                <option value="L2">L2 - Doctor Access</option>
                <option value="L3">L3 - Senior Doctor</option>
                <option value="L4">L4 - Administrator</option>
              </select>
              {errors.clearanceLevel && (
                <span className="error-message">
                  {errors.clearanceLevel.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="department">Department (Optional)</label>
              <input
                id="department"
                type="text"
                {...register("department")}
                placeholder="Enter department"
                className={errors.department ? "error" : ""}
              />
              {errors.department && (
                <span className="error-message">
                  {errors.department.message}
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--lg w-100"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="signup-footer">
          <p>
            Already have an account?{" "}
            <button
              type="button"
              className="btn btn--link"
              onClick={() => navigate("/login")}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
