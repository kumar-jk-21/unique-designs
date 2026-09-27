import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as api from '../services/endpoints';
import { getErrorMessage, getFieldErrors } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader, EmptyState } from '../components/Common';

const initialForm = { fullName: '', email: '', mobileNumber: '', password: '', confirmPassword: '' };

export default function AdminAdmins() {
  const { isSuperAdmin, user: currentUser } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [profileImage, setProfileImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.getAdmins();
      setAdmins(data.data.admins);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    setErrors({});
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    if (profileImage) formData.append('profileImage', profileImage);

    try {
      await api.createAdmin(formData);
      toast.success('Admin created successfully');
      setForm(initialForm);
      setProfileImage(null);
      load();
    } catch (err) {
      setErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleStatus(admin) {
    try {
      await api.updateAdminStatus(admin.id, !admin.isActive);
      toast.success(`Admin ${admin.isActive ? 'deactivated' : 'activated'}`);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (!isSuperAdmin) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Admins</h1>
        <EmptyState message="Only a Super Admin can view and manage administrator accounts." />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admins</h1>

      <form onSubmit={handleCreate} className="card p-6 grid sm:grid-cols-2 gap-4 mb-8">
        <h2 className="sm:col-span-2 font-semibold text-lg">Create New Admin</h2>
        <div>
          <label className="label-text">Full Name</label>
          <input className="input-field" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          {errors.fullName && <p className="error-text">{errors.fullName}</p>}
        </div>
        <div>
          <label className="label-text">Email</label>
          <input type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>
        <div>
          <label className="label-text">Mobile Number</label>
          <input className="input-field" value={form.mobileNumber} onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })} />
          {errors.mobileNumber && <p className="error-text">{errors.mobileNumber}</p>}
        </div>
        <div>
          <label className="label-text">Profile Image</label>
          <input type="file" accept="image/*" onChange={(e) => setProfileImage(e.target.files[0])} />
        </div>
        <div>
          <label className="label-text">Password</label>
          <input type="password" className="input-field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {errors.password && <p className="error-text">{errors.password}</p>}
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
        <div className="sm:col-span-2">
          <button type="submit" disabled={creating} className="btn-primary">
            {creating ? 'Creating...' : 'Create Admin'}
          </button>
        </div>
      </form>

      {loading ? (
        <Loader />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="p-3 font-medium">{a.fullName}</td>
                  <td className="p-3">{a.email}</td>
                  <td className="p-3">{a.role}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${a.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {a.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-3">
                    {a.role === 'SUPER_ADMIN' ? (
                      <span className="text-gray-400 text-xs">Protected</span>
                    ) : a.id === currentUser.id ? (
                      <span className="text-gray-400 text-xs">You</span>
                    ) : (
                      <button onClick={() => handleToggleStatus(a)} className="text-brand-600 hover:underline">
                        {a.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
