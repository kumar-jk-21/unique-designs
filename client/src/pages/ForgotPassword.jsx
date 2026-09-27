import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as api from '../services/endpoints';
import { getErrorMessage } from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.forgotPassword(email);
      toast.success('If this email is registered, an OTP has been sent to it.');
      navigate('/verify-otp', { state: { email } });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page py-16 max-w-md mx-auto">
      <div className="card p-8">
        <h1 className="text-2xl font-bold mb-1">Forgot Password?</h1>
        <p className="text-sm text-gray-500 mb-6">Enter your registered email address.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">Email</label>
            <input
              type="email"
              required
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
      </div>
    </div>
  );
}
