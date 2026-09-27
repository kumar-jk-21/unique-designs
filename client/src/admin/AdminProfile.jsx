import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/endpoints';
import { getErrorMessage, getFieldErrors } from '../services/api';

export default function AdminProfile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ fullName: user?.fullName || '', mobileNumber: user?.mobileNumber || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [pwErrors, setPwErrors] = useState({});
  const [saving, setSaving] = useState(false);

  async function handleProfileSave(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const { data } = await api.updateProfile(form);
      setUser(data.data.user);
      toast.success('Profile updated successfully');
    } catch (err) {
      setErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    setPwErrors({});
    try {
      await api.changePassword(pwForm);
      toast.success('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div className="max-w-xl space-y-8">
      <div className="card p-6">
        <h2 className="font-semibold text-lg mb-4">Admin Profile</h2>
        <p className="text-sm text-gray-500 mb-4">
          {user?.email} · <span className="uppercase font-semibold">{user?.role?.replace('_', ' ')}</span>
        </p>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="label-text">Full Name</label>
            <input
              className="input-field"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
            {errors.fullName && <p className="error-text">{errors.fullName}</p>}
          </div>
          <div>
            <label className="label-text">Mobile Number</label>
            <input
              className="input-field"
              value={form.mobileNumber}
              onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
            />
            {errors.mobileNumber && <p className="error-text">{errors.mobileNumber}</p>}
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-lg mb-4">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="label-text">Current Password</label>
            <input
              type="password"
              className="input-field"
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
            />
            {pwErrors.currentPassword && <p className="error-text">{pwErrors.currentPassword}</p>}
          </div>
          <div>
            <label className="label-text">New Password</label>
            <input
              type="password"
              className="input-field"
              value={pwForm.newPassword}
              onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
            />
            {pwErrors.newPassword && <p className="error-text">{pwErrors.newPassword}</p>}
          </div>
          <div>
            <label className="label-text">Confirm New Password</label>
            <input
              type="password"
              className="input-field"
              value={pwForm.confirmPassword}
              onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
            />
            {pwErrors.confirmPassword && <p className="error-text">{pwErrors.confirmPassword}</p>}
          </div>
          <button type="submit" className="btn-primary">
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}
