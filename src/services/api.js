// src/services/api.js
import axios from 'axios';

// 1. O React (Create React App) lê a variável de ambiente REACT_APP_API_URL.
//    Em produção (Vercel), ele usará o valor que você configurou no painel.
//    Em desenvolvimento (local), ele usará o valor do seu arquivo .env.
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, 
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;