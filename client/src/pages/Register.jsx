import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage, getFieldErrors } from '../services/api';

const initialForm = {
  fullName: '',
  mobileNumber: '',
  dateOfBirth: '',
  email: '',
  address: '',
  pincode: '',
  doorNumber: '',
  streetName: '',
  district: '',
  state: '',
  password: '',
  confirmPassword: '',
};

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [profileImage, setProfileImage] = useState(null);
  const [errors, setErrors] = useState({});

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (profileImage) formData.append('profileImage', profileImage);

    try {
      await register(formData);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      setErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err));
    }
  }

  const fields = [
    { key: 'fullName', label: 'Full Name', type: 'text' },
    { key: 'mobileNumber', label: 'Mobile Number', type: 'text' },
    { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'doorNumber', label: 'Door Number', type: 'text' },
    { key: 'streetName', label: 'Street Name', type: 'text' },
    { key: 'address', label: 'Address', type: 'text' },
    { key: 'pincode', label: 'Pincode', type: 'text' },
    { key: 'district', label: 'District', type: 'text' },
    { key: 'state', label: 'State', type: 'text' },
  ];

  return (
    <div className="container-page py-16 max-w-2xl mx-auto">
      <div className="card p-8">
        <h1 className="text-2xl font-bold mb-1">Create Your Account</h1>
        <p className="text-sm text-gray-500 mb-6">Join Unique Designs</p>

        <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="label-text">{f.label} *</label>
              <input
                type={f.type}
                className="input-field"
                value={form[f.key]}
                onChange={(e) => update(f.key, e.target.value)}
              />
              {errors[f.key] && <p className="error-text">{errors[f.key]}</p>}
            </div>
          ))}

          <div className="sm:col-span-2">
            <label className="label-text">Profile Image</label>
            <input type="file" accept="image/*" onChange={(e) => setProfileImage(e.target.files[0])} />
          </div>

          <div>
            <label className="label-text">Password *</label>
            <input
              type="password"
              className="input-field"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
            />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>
          <div>
            <label className="label-text">Confirm Password *</label>
            <input
              type="password"
              className="input-field"
              value={form.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
            />
            {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
          </div>

          <div className="sm:col-span-2">
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
