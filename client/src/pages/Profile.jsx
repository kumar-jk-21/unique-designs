import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as api from '../services/endpoints';
import { assetUrl, getErrorMessage, getFieldErrors } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/Common';

export default function Profile() {
  const { setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwErrors, setPwErrors] = useState({});

  useEffect(() => {
    api
      .getProfile()
      .then((res) => {
        const u = res.data.data.user;
        setProfile(u);
        setForm({
          fullName: u.fullName || '',
          mobileNumber: u.mobileNumber || '',
          dateOfBirth: u.dateOfBirth ? u.dateOfBirth.substring(0, 10) : '',
          address: u.address || '',
          pincode: u.pincode || '',
          doorNumber: u.doorNumber || '',
          streetName: u.streetName || '',
          district: u.district || '',
          state: u.state || '',
        });
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const { data } = await api.updateProfile(form);
      setProfile(data.data.user);
      setUser(data.data.user);
      toast.success('Profile updated successfully');
    } catch (err) {
      setErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('profileImage', file);
    try {
      const { data } = await api.updateProfileImage(formData);
      setProfile(data.data.user);
      setUser(data.data.user);
      toast.success('Profile image updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
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

  if (loading) return <Loader label="Loading profile..." />;

  const fields = [
    ['fullName', 'Full Name'],
    ['mobileNumber', 'Mobile Number'],
    ['dateOfBirth', 'Date of Birth', 'date'],
    ['doorNumber', 'Door Number'],
    ['streetName', 'Street Name'],
    ['address', 'Address'],
    ['pincode', 'Pincode'],
    ['district', 'District'],
    ['state', 'State'],
  ];

  return (
    <div className="container-page py-10 max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">My Profile</h1>

      <div className="card p-6 flex items-center gap-5">
        <img
          src={assetUrl(profile.profileImage) || 'https://placehold.co/80x80'}
          alt="Profile"
          className="w-20 h-20 rounded-full object-cover bg-gray-100"
        />
        <div>
          <label className="btn-outline text-sm cursor-pointer inline-block">
            Change Photo
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
          <p className="text-sm text-gray-500 mt-2">{profile.email}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="card p-6 grid sm:grid-cols-2 gap-4">
        <h2 className="sm:col-span-2 font-semibold text-lg">Personal Details</h2>
        {fields.map(([key, label, type]) => (
          <div key={key}>
            <label className="label-text">{label}</label>
            <input
              type={type || 'text'}
              className="input-field"
              value={form[key] || ''}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
            {errors[key] && <p className="error-text">{errors[key]}</p>}
          </div>
        ))}
        <div className="sm:col-span-2">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      <form onSubmit={handlePasswordChange} className="card p-6 grid sm:grid-cols-2 gap-4">
        <h2 className="sm:col-span-2 font-semibold text-lg">Change Password</h2>
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
        <div />
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
        <div className="sm:col-span-2">
          <button type="submit" className="btn-primary">
            Change Password
          </button>
        </div>
      </form>
    </div>
  );
}
