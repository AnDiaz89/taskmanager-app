import axios from 'axios';

const api = axios.create({
  baseURL: 'https://taskmanager-api-j5j7.onrender.com/api',
});

// Interceptor: agrega el token automáticamente a cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;