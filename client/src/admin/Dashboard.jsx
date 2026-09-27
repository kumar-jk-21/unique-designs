import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as api from '../services/endpoints';
import { getErrorMessage } from '../services/api';
import { Loader } from '../components/Common';

const CARD_CONFIG = [
  { key: 'totalUsers', label: 'Total Users' },
  { key: 'totalProducts', label: 'Total Products' },
  { key: 'totalCategories', label: 'Total Categories' },
  { key: 'totalAdmins', label: 'Total Admins' },
  { key: 'totalWishlistItems', label: 'Wishlist Items' },
  { key: 'lowStockProducts', label: 'Low Stock Products' },
  { key: 'activeProducts', label: 'Active Products' },
  { key: 'inactiveProducts', label: 'Inactive Products' },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api
      .getAdminDashboard()
      .then((res) => setStats(res.data.data))
      .catch((err) => toast.error(getErrorMessage(err)));
  }, []);

  if (!stats) return <Loader label="Loading dashboard..." />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {CARD_CONFIG.map((c) => (
          <div key={c.key} className="card p-5 text-center">
            <p className="text-3xl font-bold text-brand-700">{stats[c.key]}</p>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
