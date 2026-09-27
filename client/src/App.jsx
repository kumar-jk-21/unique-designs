import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

// Public pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import ResetPassword from './pages/ResetPassword';

// User pages
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';

// Admin
import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/Dashboard';
import AdminProducts from './admin/AdminProducts';
import AdminProductForm from './admin/AdminProductForm';
import AdminCategories from './admin/AdminCategories';
import AdminUsers from './admin/AdminUsers';
import AdminAdmins from './admin/AdminAdmins';
import AdminProfile from './admin/AdminProfile';

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <h1 className="text-3xl font-bold mb-2">404</h1>
      <p className="text-gray-500">The page you're looking for doesn't exist.</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public storefront */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/products" element={<PublicLayout><Products /></PublicLayout>} />
      <Route path="/products/:id" element={<PublicLayout><ProductDetails /></PublicLayout>} />
      <Route path="/category/:slug" element={<PublicLayout><Products /></PublicLayout>} />
      <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
      <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
      <Route path="/forgot-password" element={<PublicLayout><ForgotPassword /></PublicLayout>} />
      <Route path="/verify-otp" element={<PublicLayout><VerifyOTP /></PublicLayout>} />
      <Route path="/reset-password" element={<PublicLayout><ResetPassword /></PublicLayout>} />

      {/* Authenticated user pages */}
      <Route
        path="/user/profile"
        element={
          <ProtectedRoute>
            <PublicLayout><Profile /></PublicLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/wishlist"
        element={
          <ProtectedRoute>
            <PublicLayout><Wishlist /></PublicLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/user/cart" element={<PublicLayout><Cart /></PublicLayout>} />

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/add" element={<AdminProductForm />} />
        <Route path="products/edit/:id" element={<AdminProductForm />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="users" element={<AdminUsers />} />
        <Route
          path="admins"
          element={
            <AdminRoute requireSuperAdmin>
              <AdminAdmins />
            </AdminRoute>
          }
        />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
    </Routes>
  );
}
