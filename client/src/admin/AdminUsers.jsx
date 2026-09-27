import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as api from '../services/endpoints';
import { getErrorMessage } from '../services/api';
import { Loader, EmptyState } from '../components/Common';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  async function load(page = 1) {
    setLoading(true);
    try {
      const { data } = await api.getAdminUsers({ search: search || undefined, page, limit: 15 });
      setUsers(data.data.users);
      setPagination(data.data.pagination);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleToggleStatus(user) {
    try {
      await api.updateUserStatus(user.id, !user.isActive);
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
      load(pagination.page);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Users</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          load(1);
        }}
        className="mb-4 max-w-sm"
      >
        <input
          className="input-field"
          placeholder="Search by name, email, mobile..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>

      {loading ? (
        <Loader />
      ) : users.length === 0 ? (
        <EmptyState message="No users found." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Mobile</th>
                <th className="p-3">District</th>
                <th className="p-3">State</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-3 font-medium">{u.fullName}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.mobileNumber}</td>
                  <td className="p-3">{u.district || '—'}</td>
                  <td className="p-3">{u.state || '—'}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-3">
                    <button onClick={() => handleToggleStatus(u)} className="text-brand-600 hover:underline">
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pagination.totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => load(i + 1)}
              className={`w-9 h-9 rounded-full text-sm ${
                pagination.page === i + 1 ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
