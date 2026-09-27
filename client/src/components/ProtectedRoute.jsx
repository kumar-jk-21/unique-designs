import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

export function AdminRoute({ children, requireSuperAdmin = false }) {
  const { user, isAdmin, isSuperAdmin } = useAuth();

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
}
