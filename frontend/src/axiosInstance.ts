import axios from "axios";
import Cookies from "js-cookie";
import {LOGIN, REGISTRATION} from '@api/authorization/endpoints'


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
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Only redirect for 401 errors if it's not a login or register request
        if (error.response && error.response.status === 401 && 
            !error.config.url.includes(LOGIN) && 
            !error.config.url.includes(REGISTRATION)) {
            
            Cookies.remove('access_token');
            if (window.location.pathname !== '/') {
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
