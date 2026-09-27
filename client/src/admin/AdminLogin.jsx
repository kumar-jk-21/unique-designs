import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';

export default function AdminLogin() {
  const { login, loading, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ emailOrMobile: '', password: '' });

  if (user && isAdmin) {
    navigate('/admin/dashboard');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const loggedInUser = await login(form);
      if (loggedInUser.role !== 'ADMIN' && loggedInUser.role !== 'SUPER_ADMIN') {
        toast.error('This login is for administrators only.');
        return;
      }
      toast.success('Welcome back, admin!');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="card p-8 w-full max-w-sm">
        <h1 className="font-display text-2xl font-bold text-center mb-1">Unique Designs</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Admin Panel Login</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">Email</label>
            <input
              type="email"
              required
              className="input-field"
              value={form.emailOrMobile}
              onChange={(e) => setForm({ ...form, emailOrMobile: e.target.value })}
            />
          </div>
          <div>
            <label className="label-text">Password</label>
            <input
              type="password"
              required
              className="input-field"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
