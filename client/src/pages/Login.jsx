import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage, getFieldErrors } from '../services/api';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ emailOrMobile: '', password: '' });
  const [errors, setErrors] = useState({});

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    try {
      await login(form);
      toast.success('Welcome back!');
      navigate(location.state?.from?.pathname || '/');
    } catch (err) {
      setErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div className="container-page py-16 max-w-md mx-auto">
      <div className="card p-8">
        <h1 className="text-2xl font-bold mb-1">Welcome Back</h1>
        <p className="text-sm text-gray-500 mb-6">Login to your Unique Designs account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">Email or Mobile Number</label>
            <input
              type="text"
              className="input-field"
              value={form.emailOrMobile}
              onChange={(e) => setForm({ ...form, emailOrMobile: e.target.value })}
            />
            {errors.emailOrMobile && <p className="error-text">{errors.emailOrMobile}</p>}
          </div>
          <div>
            <label className="label-text">Password</label>
            <input
              type="password"
              className="input-field"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-brand-600 hover:underline">
              Forgot Password?
            </Link>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-600 font-semibold hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
