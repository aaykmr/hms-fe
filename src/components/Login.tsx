import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/components/Login.scss';

const schema = yup.object({
  staffId: yup.string().required('Staff ID is required'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
}).required();

type LoginFormData = yup.InferType<typeof schema>;

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');
    
    try {
      await login(data.staffId, data.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Hospital Management System</h1>
          <p>Sign in to your account</p>
        </div>

        {error && (
          <div className="alert alert--error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          <div className="form-group">
            <label htmlFor="staffId">Staff ID</label>
            <input
              id="staffId"
              type="text"
              {...register('staffId')}
              placeholder="Enter your staff ID"
              className={errors.staffId ? 'error' : ''}
            />
            {errors.staffId && (
              <span className="error-message">{errors.staffId.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              {...register('password')}
              placeholder="Enter your password"
              className={errors.password ? 'error' : ''}
            />
            {errors.password && (
              <span className="error-message">{errors.password.message}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--lg w-100"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <button
              type="button"
              className="btn btn--link"
              onClick={() => navigate('/signup')}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
