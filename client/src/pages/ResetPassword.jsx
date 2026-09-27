import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as api from '../services/endpoints';
import { getErrorMessage, getFieldErrors } from '../services/api';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const resetToken = location.state?.resetToken;
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!resetToken) {
      toast.error('Reset session expired. Please verify OTP again.');
      navigate('/forgot-password');
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      await api.resetPassword({ ...form, resetToken });
      toast.success('Password reset successfully. Please log in.');
      navigate('/login');
    } catch (err) {
      setErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page py-16 max-w-md mx-auto">
      <div className="card p-8">
        <h1 className="text-2xl font-bold mb-1">Set New Password</h1>
        <p className="text-sm text-gray-500 mb-6">Choose a strong new password for your account.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">New Password</label>
            <input
              type="password"
              className="input-field"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            />
            {errors.newPassword && <p className="error-text">{errors.newPassword}</p>}
          </div>
          <div>
            <label className="label-text">Confirm Password</label>
            <input
              type="password"
              className="input-field"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
            {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
