import axios from 'axios';

// API configuration - calls backend directly to avoid Netlify routing conflicts
const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000/api'  // Use local server in development
    : 'https://shopping-ivig.onrender.com/api'; // Use deployed server in production

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
