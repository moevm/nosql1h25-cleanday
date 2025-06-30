import {ReactNode, useEffect, useState} from 'react';
import Cookies from "js-cookie";
import {useNavigate} from 'react-router-dom';

import {AuthContext} from './context';
import {AuthContextType} from './types';
import axiosInstance from "@/axiosInstance";
import {GET_ME} from "@api/authorization/endpoints.ts";

export const AuthProvider = ({children}: { children: ReactNode }) => {
    // Проверяем наличие токена при инициализации
    const existingToken = Cookies.get('access_token');
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!existingToken);
    const [username, setUsername] = useState<string>('');
    const [token, setToken] = useState<string>(existingToken || '');
    const navigate = useNavigate();

    // Получаем информацию о пользователе при наличии токена
    useEffect(() => {
        if (existingToken) {
            // Загрузим информацию о текущем пользователе
            axiosInstance.get(GET_ME)
                .then(response => {
                    setUsername(response.data.username || '');
                })
                .catch(() => {
                    // Если токен недействителен, выполняем выход
                    logout();
                });
        }
    }, []);

    const login = (newToken: string, user: string) => {
        setToken(newToken);
        setUsername(user);
        setIsAuthenticated(true);
        const expires = new Date(new Date().getTime() + 480 * 60 * 1000);
        Cookies.set('access_token', newToken, {expires});
    };

    const logout = () => {
        // Clear auth data
        setToken('');
        setUsername('');
        setIsAuthenticated(false);
        
        // Remove cookies
        Cookies.remove('access_token');
        
        // Navigate to home page
        navigate('/');
    };

    const authContextValue: AuthContextType = {
        isAuthenticated,
        username,
        token,
        login,
        logout,
        setUsername
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};
