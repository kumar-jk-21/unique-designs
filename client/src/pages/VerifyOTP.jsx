import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as api from '../services/endpoints';
import { getErrorMessage } from '../services/api';

export default function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.verifyOtp(email, otp);
      toast.success('OTP verified successfully');
      navigate('/reset-password', { state: { resetToken: data.data.resetToken } });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page py-16 max-w-md mx-auto">
      <div className="card p-8">
        <h1 className="text-2xl font-bold mb-1">Verify OTP</h1>
        <p className="text-sm text-gray-500 mb-6">
          Enter the 6-digit OTP sent to your email. It expires in 5 minutes.
        </p>
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
          <div>
            <label className="label-text">OTP</label>
            <input
              type="text"
              required
              maxLength={6}
              className="input-field tracking-widest text-center text-lg"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Didn't get it?{' '}
          <Link to="/forgot-password" className="text-brand-600 font-semibold hover:underline">
            Resend OTP
          </Link>
        </p>
      </div>
    </div>
  );
}
