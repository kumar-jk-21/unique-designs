import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ud_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ud_token');
      localStorage.removeItem('ud_user');
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error) {
  return error?.response?.data?.message || 'Something went wrong. Please try again.';
}

export function getFieldErrors(error) {
  return error?.response?.data?.errors || {};
}

export function assetUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const base = API_BASE_URL.replace(/\/api\/?$/, '');
  return `${base}${path}`;
}

export default api;
