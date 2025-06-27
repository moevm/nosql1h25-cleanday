import axios from 'axios';
import Cookies from 'js-cookie';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// Request interceptor to add authorization header
axiosInstance.interceptors.request.use(
    (config) => {
        const token = Cookies.get('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Improved response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // If error is 401
        if (error.response && error.response.status === 401) {
            // Check if this is a status update operation (PATCH to cleanday endpoint)
            const isPatchRequest = error.config?.method?.toLowerCase() === 'patch';
            const isCleandayStatusUpdate =
                error.config?.url?.includes('/api/cleandays/') &&
                !error.config?.url?.includes('/auth/');

            // Don't automatically logout for Cleanday PATCH operations that return 401
            // These are likely permission failures, not authentication failures
            if (isPatchRequest && isCleandayStatusUpdate) {
                console.warn('You don\'t have permission to update this cleanday');
                // Return the rejection but don't logout
                return Promise.reject(error);
            }

            // For other 401 errors, logout as normal
            Cookies.remove('access_token');
            // Store the current path to redirect back after login
            const currentPath = window.location.pathname;
            
            // Не перенаправляем на главную, если пользователь на главной странице, пытается войти или зарегистрироваться
            if (currentPath !== '/' && currentPath !== '/authorization' && currentPath !== '/register') {
                // Удаляем токен из Cookie
                Cookies.remove('access_token');
                // Перенаправляем на страницу авторизации
                window.location.href = '/';
            }
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance;