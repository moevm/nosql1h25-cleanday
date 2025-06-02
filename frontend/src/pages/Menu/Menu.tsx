import './Menu.css';

import * as React from 'react';

import {Link, useNavigate} from 'react-router-dom';
import {Container, Typography, Box, Toolbar, Button, Avatar, AppBar, IconButton} from '@mui/material';

import {ExitToApp} from '@mui/icons-material';

import {createContext, useContext} from 'react';
import LogoutConfirmationDialog from "../../components/dialog/LogoutConfirmationDialog.tsx";

/**
 * Интерфейс `AuthContextType` определяет структуру контекста аутентификации.
 * @param {boolean} isLoggedIn - Флаг, показывающий, залогинен ли пользователь.
 * @param {string} username - Имя пользователя.
 * @param {function} loginUT - Функция для логина пользователя. Принимает токен и имя пользователя.
 * @param {function} logout - Функция для выхода пользователя из системы.
 */
interface AuthContextType {
    isLoggedIn: boolean;
    username: string;
    UserLoginToken: (token: string, username: string) => void;
    UserLogoutToken: () => void;
}

/**
 * `AuthContext`: Создание контекста аутентификации.
 * createContext() создает объект контекста, который может быть использован для передачи данных между компонентами без необходимости явной передачи через props.
 * Значение по умолчанию включает в себя флаг isLoggedIn, имя пользователя и пустые функции для loginUT и logout.
 */
const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    username: '',
    UserLoginToken: () => {
    },
    UserLogoutToken: () => {
    },
});

/**
 * Интерфейс `AuthProviderProps` определяет структуру props для AuthProvider.
 * @param {React.ReactNode} children - Дочерние элементы, которые будут обернуты провайдером контекста.
 */
interface AuthProviderProps {
    children: React.ReactNode;
}

/**
 * `AuthProvider`: Функциональный компонент, предоставляющий контекст аутентификации.
 * Оборачивает дочерние компоненты и предоставляет им доступ к данным аутентификации (isLoggedIn, username) и функциям для управления состоянием аутентификации (login, logout).
 * Использует useState для хранения состояния аутентификации и localStorage для сохранения данных между сессиями.
 *
 * @param {AuthProviderProps} { children } -  children: React-элементы, которые необходимо "обернуть" данным провайдером.
 * @returns {JSX.Element} - Возвращает JSX-элемент, представляющий AuthContext.Provider, который предоставляет значение контекста всем дочерним компонентам.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({children}: AuthProviderProps): React.JSX.Element => {
    const [isLoggedIn, setIsLoggedIn] = React.useState(!!localStorage.getItem('token'));
    const [username, setUsername] = React.useState(localStorage.getItem('username') || '');

    const login = (token: string, username: string) => {
        localStorage.setItem('token', token); //бахните проверку токена
        localStorage.setItem('username', username);
        setIsLoggedIn(true);
        setUsername(username);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setIsLoggedIn(false);
        setUsername('');
    };

    const value: AuthContextType = {
        isLoggedIn,
        username,
        UserLoginToken: login,
        UserLogoutToken: logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};


/**
 * `useAuth`: Кастомный хук для использования контекста аутентификации.
 * Позволяет компонентам подписываться на контекст аутентификации и получать доступ к данным и функциям аутентификации.
 *
 * @returns {AuthContextType} - Возвращает значение контекста AuthContext.
 */
export const useAuth = () => {
    return useContext(AuthContext);
};


/**
 * `Menu`: Функциональный компонент, представляющий меню приложения.
 * Отображает панель навигации с кнопками для перехода между страницами и кнопками аутентификации.
 * Использует хук `useAuth` для получения данных аутентификации и хук `useNavigate` для навигации.
 *
 * @returns {JSX.Element} - Возвращает JSX-элемент, представляющий меню приложения.
 */

export const Menu = (): React.JSX.Element => {
    const {isLoggedIn, username, UserLogoutToken} = useAuth();
    const navigate = useNavigate(); // Используем useNavigate

    // Состояние для диалога подтверждения выхода
    const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);

    // Обработчик подтверждения выхода
    const handleLogout = () => {
        UserLogoutToken();
        navigate('/'); // Перенаправляем на главную после логаута
    };

    return (
        <div className="menuContainer">
            <Typography color={'#345e51'} variant="h4" fontWeight="bold">Вместе — к чистой планете! </Typography>
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    height: 64,
                    backgroundColor: 'transparent',
                    color: 'black',
                }}
            >
                {isLoggedIn && (
                    <Toolbar>
                        <Box sx={{flexGrow: 1}}/>
                        <Avatar style={{marginRight: '10px'}}
                            // Аватар крепить сюда !!!
                                onClick={() => {
                                    {
                                        navigate('/profile');
                                    }
                                }}
                        >{username.charAt(0).toUpperCase()}
                        </Avatar>
                        <IconButton
                            size="large"
                            color="inherit"
                            sx={{'&:focus': {outline: 'none'},}}
                            onClick={() => {
                                setLogoutDialogOpen(true);
                            }}
                        >
                            <ExitToApp/>
                        </IconButton>
                    </Toolbar>
                )}
            </AppBar>
            <Toolbar sx = {{ borderRadius: '8%'}}  className="menuToolbar">
                <Box   className="toolbarContent">
                    <Typography variant="h2" component="div">
                        Сервис организации субботников
                    </Typography>
                </Box>
            </Toolbar>

            <Container maxWidth="md">
                <Box className="buttonContainer">
                    {/* Меню */}
                    <Box className="menuButtons">
                        <Button
                            sx={{
                                backgroundColor: '#3C6C5F',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: '#345e51',
                                },
                                height: '50px',
                            }}
                            component={Link} to="/cleandays" variant="contained" color="success">
                            <h2>Субботники</h2>
                        </Button>
                        <Button
                            sx={{
                                backgroundColor: '#3C6C5F',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: '#345e51',
                                },
                                height: '50px',
                            }}
                            component={Link} to="/users" variant="contained" color="success">
                            <h2>Пользователи</h2>
                        </Button>
                        <Button
                            sx={{
                                backgroundColor: '#3C6C5F',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: '#345e51',
                                },
                                height: '50px',
                            }}
                            component={Link} to="/statistics" variant="contained" color="success">
                            <h2>Статистика</h2>
                        </Button>
                    </Box>

                    {/* Кнопки аутентификации */}
                    {!isLoggedIn && (
                        <Box className="authButtons">
                            <Button
                                sx={{
                                    fontWeight: 'bold',
                                    fontSize: 'large',
                                    color: '#3C6C5F',
                                }}
                                component={Link} to="/authorization" variant="text" color="success">
                                Войти
                            </Button>
                            <Button
                                sx={{
                                    fontWeight: 'bold',
                                    fontSize: 'large',
                                    color: '#3C6C5F',
                                }}
                                component={Link} to="/register" variant="text" color="success">
                                Зарегистрироваться
                            </Button>
                        </Box>
                    )}
                </Box>

                <Box mt={4} display="flex" justifyContent="center">
                    <img src="/img.png" alt="Statistics Page" style={{ maxWidth: '100%', height: 'auto' }} />
                </Box>
            </Container>
            {/* Диалог подтверждения выхода */}
            <LogoutConfirmationDialog
                open={logoutDialogOpen}
                onClose={() => setLogoutDialogOpen(false)}
                onConfirm={handleLogout}
            />
        </div>
    );
}

export default Menu;

