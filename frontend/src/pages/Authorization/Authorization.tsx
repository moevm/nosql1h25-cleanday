import './Authorization.css';

import * as React from 'react';

import {
    Container,
    Typography,
    TextField,
    Button,
    Box,
    Toolbar,
} from '@mui/material';
import {Link, useNavigate} from 'react-router-dom';
import {useAuth} from '../Menu/Menu';
import {LogIn} from '../../models/User.ts';

/**
 * `Authorization`: Функциональный компонент, отвечающий за отображение формы авторизации пользователя.
 * Использует Material UI для стилизации и управления формой.
 * Отправляет данные для авторизации на сервер и перенаправляет пользователя в случае успеха.
 *
 * @returns {JSX.Element} - Возвращает JSX-элемент, представляющий форму авторизации.
 */
export const Authorization = (): React.JSX.Element=> {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    // Хук для навигации по страницам
    const navigate = useNavigate();
    const {UserLoginToken} = useAuth();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const loginData: LogIn = {
            login: username,
            password: password,
        };

        // Раскомментить для тестов, тогда логин - user, пароль - password.
        // if (username === 'user' && password === 'password') {
        //     const token = 'fake_token';
        //     UserLoginToken(token, username);
        //     navigate('/');
        // } else {
        //     alert('Неверный логин или пароль');
        // }

        try {
            const response = await fetch('/api/login', { // Заменить на эндпоинтом API
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData),
            });

            if (response.ok) {
                const data = await response.json(); // API возвращает токен !!! Он должен совпадать с token в Меню
                const token = data.token; // Извлекаем токен из ответа API
                UserLoginToken(token, username);
                navigate('/');
            } else {
                console.error('Ошибка авторизации:', response.status);
                alert('Неверный логин или пароль');
            }
        } catch (error) {
            console.error('Ошибка при отправке запроса:', error);
            alert('Произошла ошибка при попытке входа.');
        }
    };


    const textFieldStyle = {
        '& .MuiOutlinedInput-root': {
            '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: '2px',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#F85E28FF',
            },
        },
        '& label.Mui-focused': {
            color: '#F85E28FF',
        },
    };


    return (
        <Container component="main" maxWidth="xs" className="login-container">
            <Box className="login-box">
                <Toolbar className="authToolbar">
                    <Box className="toolbarContent">
                        <Typography variant="h2" component="div">
                            Сервис организации субботников
                        </Typography>
                    </Box>
                </Toolbar>
                <Box component="form" onSubmit={handleSubmit} noValidate className="login-form">
                    <TextField
                        sx={textFieldStyle}
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Логин"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        sx={textFieldStyle}
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Пароль"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        sx={{
                            backgroundColor: '#F85E28',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: '#ea5624',
                            },
                        }}
                        type="submit"
                        fullWidth
                        variant="contained"
                        className="login-button"
                    >
                        Войти
                    </Button>
                    <Box className="login-actions">
                        <Button
                            sx={{
                                backgroundColor: '#3C6C5F',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: '#345e51',
                                },
                            }}
                            fullWidth
                            component={Link}
                            to="/"
                            variant="contained"
                            color="success"
                        >
                            На главную
                        </Button>
                        <Button
                            sx={{
                                backgroundColor: '#3C6C5F',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: '#345e51',
                                },
                            }}
                            fullWidth
                            component={Link}
                            to="/register"
                            variant="contained"
                            color="success"
                        >
                            Регистрация
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Container>
    );
}

export default Authorization;

