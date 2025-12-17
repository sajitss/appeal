import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api', // Direct connection to backend
    headers: {
        'Content-Type': 'application/json',
    },
});

import i18n from '@/lib/i18n';

// Add a request interceptor to attach the auth token if available
api.interceptors.request.use(
    (config) => {
        // Check if running in browser to access localStorage
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Token ${token}`;
            }
            // Add Language Header for Backend Localization
            config.headers['Accept-Language'] = i18n.language || 'en';
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
