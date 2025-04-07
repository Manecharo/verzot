import axios from 'axios';
import authHeader from './auth-header';

// Create a base API instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Add auth header to every request
    const headers = authHeader();
    
    if (headers.Authorization) {
      config.headers.Authorization = headers.Authorization;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    // Any status code within 2xx range
    return response;
  },
  (error) => {
    // Handle session expiration (401 Unauthorized)
    if (error.response && error.response.status === 401) {
      // Clear user data from localStorage
      localStorage.removeItem('user');
      
      // Redirect to login page if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 