import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/admins', label: 'Admins' },
  { to: '/admin/profile', label: 'Profile' },
];

export default function AdminLayout() {
  const { user, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/admin/login');
  }

  const visibleLinks = LINKS.filter((l) => l.to !== '/admin/admins' || isSuperAdmin);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="hidden md:flex md:flex-col w-56 bg-gray-900 text-gray-300 fixed inset-y-0">
        <div className="p-5 font-display text-xl text-white border-b border-gray-800">Unique Designs</div>
        <nav className="flex-1 py-4">
          {visibleLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `block px-5 py-3 text-sm ${isActive ? 'bg-brand-600 text-white' : 'hover:bg-gray-800'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <button onClick={handleLogout} className="p-5 text-left text-sm text-red-400 hover:bg-gray-800 border-t border-gray-800">
          Logout
        </button>
      </aside>

      <div className="flex-1 md:ml-56">
        <header className="bg-white border-b h-14 flex items-center justify-between px-5 md:hidden">
          <span className="font-display font-bold">Unique Designs Admin</span>
          <button onClick={() => setMobileOpen((v) => !v)} className="text-2xl">
            ☰
          </button>
        </header>
        {mobileOpen && (
          <div className="md:hidden bg-gray-900 text-gray-300">
            {visibleLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="block px-5 py-3 text-sm border-b border-gray-800"
              >
                {link.label}
              </NavLink>
            ))}
            <button onClick={handleLogout} className="w-full text-left px-5 py-3 text-sm text-red-400">
              Logout
            </button>
          </div>
        )}
        <main className="p-6">
          <div className="flex justify-end mb-4 text-sm text-gray-500">
            Logged in as <span className="font-semibold ml-1">{user?.fullName}</span> ({user?.role})
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
