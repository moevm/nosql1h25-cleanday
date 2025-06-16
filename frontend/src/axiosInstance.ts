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
            // Получаем текущий URL
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
