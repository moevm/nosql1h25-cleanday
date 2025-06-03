import {ReactNode, useEffect, useState} from 'react';

import Cookies from 'js-cookie';

import {useNavigate} from 'react-router-dom';

import {AuthContext} from './context'; // Импортируем контекст
import {AuthContextType} from './types'; // Импортируем тип

export const AuthProvider = ({children}: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [username, setUsername] = useState<string>('');

    const navigate = useNavigate();

    useEffect(() => {
        const token = Cookies.get('access_token');
        if (token) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
        setIsLoading(false);
    }, []);

    const token = (accessToken: string) => {
        // Время жизни токена - 8 часов с момента получения
        const expires = new Date(new Date().getTime() + 480 * 60 * 1000);
        Cookies.set('access_token', accessToken, {expires});
        setIsAuthenticated(true);
    };

    const logout = () => {
        Cookies.remove('access_token');
        setIsAuthenticated(false);
        navigate('/');
    };

    const contextValue: AuthContextType = {isAuthenticated, token, username, setUsername, logout, isLoading};

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
