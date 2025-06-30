import axios from "axios";
import Cookies from "js-cookie";


const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = Cookies.get('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Проверяем, является ли ошибка ошибкой авторизации (401)
        if (error.response && error.response.status === 401) {
            const currentPath = window.location.pathname;
            
            // Check if this is a cleanday edit operation
            const url = error.config.url;
            const isCleandayEditOperation = url && url.includes('/api/cleandays/') && 
                (error.config.method === 'patch' || error.config.method === 'put');
            
            // Do not log out if this is a cleanday edit operation
            if (isCleandayEditOperation) {
                // Just let the component handle the error
                return Promise.reject(error);
            }
            
            // For other 401 errors, handle as before
            if (currentPath !== '/' && currentPath !== '/authorization' && currentPath !== '/register') {
                Cookies.remove('access_token');
                window.location.href = '/';
            }
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance;
