import api from './api';

// ---- Auth ----
export const registerUser = (formData) =>
  api.post('/auth/register', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const loginUser = (payload) => api.post('/auth/login', payload);
export const logoutUser = () => api.post('/auth/logout');
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const verifyOtp = (email, otp) => api.post('/auth/verify-otp', { email, otp });
export const resetPassword = (payload) => api.post('/auth/reset-password', payload);

// ---- User ----
export const getProfile = () => api.get('/users/profile');
export const updateProfile = (payload) => api.put('/users/profile', payload);
export const changePassword = (payload) => api.put('/users/change-password', payload);
export const updateProfileImage = (formData) =>
  api.post('/users/profile-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

// ---- Categories ----
export const getCategories = (params) => api.get('/categories', { params });
export const createCategory = (payload) => api.post('/categories', payload);
export const updateCategory = (id, payload) => api.put(`/categories/${id}`, payload);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// ---- Products ----
export const getProducts = (params) => api.get('/products', { params });
export const getProductById = (id) => api.get(`/products/${id}`);
export const createProduct = (formData) =>
  api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateProduct = (id, formData) =>
  api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const deleteProductImage = (id, imageId) => api.delete(`/products/${id}/images/${imageId}`);

// ---- Wishlist ----
export const getWishlist = () => api.get('/wishlist');
export const addToWishlist = (productId) => api.post('/wishlist', { productId });
export const removeFromWishlist = (productId) => api.delete(`/wishlist/${productId}`);

// ---- Cart ----
export const getCart = () => api.get('/cart');
export const addToCart = (payload) => api.post('/cart', payload);
export const updateCartItem = (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity });
export const removeCartItem = (itemId) => api.delete(`/cart/${itemId}`);
export const mergeGuestCart = (items) => api.post('/cart/merge', { items });

// ---- Admin ----
export const getAdminDashboard = () => api.get('/admin/dashboard');
export const getAdminUsers = (params) => api.get('/admin/users', { params });
export const updateUserStatus = (id, isActive) => api.put(`/admin/users/${id}/status`, { isActive });
export const getAdmins = () => api.get('/admin/admins');
export const createAdmin = (formData) =>
  api.post('/admin/create-admin', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateAdminStatus = (id, isActive) => api.put(`/admin/admins/${id}/status`, { isActive });
