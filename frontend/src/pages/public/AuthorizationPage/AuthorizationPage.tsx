import './AuthorizationPage.css';

import * as React from 'react';

import {Link} from 'react-router-dom';

import {Alert, Box, Button, Container, TextField, Toolbar, Typography,} from '@mui/material';

import {useGetAuth} from "@hooks/authorization/useGetAuth.tsx";


/**
 * `AuthorizationPage`: Функциональный компонент, отвечающий за отображение формы авторизации пользователя.
 * Использует Material UI для стилизации и управления формой.
 * Отправляет данные для авторизации на сервер и перенаправляет пользователя в случае успеха.
 *
 * @returns {JSX.Element} - Возвращает JSX-элемент, представляющий форму авторизации.
 */
export const AuthorizationPage = (): React.JSX.Element => {
    const mutation = useGetAuth();

    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');

    const [isError, setIsError] = React.useState(false);

    // Отслеживаем наличие ошибки из мутации
    React.useEffect(() => {
        if (mutation.error) {
            setIsError(true);
        }
    }, [mutation.error]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsError(false); // Сбрасываем состояние ошибки при новой попытке
        mutation.mutate({username: username, password: password});
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
                    {isError && (
                        <Alert
                            severity='error'
                            sx={{
                                mt: 2,
                                mb: 2,
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                backgroundColor: 'rgba(211, 47, 47, 0.15)',
                                border: '1px solid #b60205',
                                '& .MuiAlert-icon': {
                                    fontSize: '1.5rem'
                                }
                            }}
                        >
                            Неверный логин или пароль! Пожалуйста, попробуйте снова.
                        </Alert>
                    )}
                    <Button
                        sx={{
                            backgroundColor: '#F85E28',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: '#ea5624',
                            },
                            minWidth: '110px',
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
                                minWidth: '110px',
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
                                minWidth: '110px',
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
                <Box mt={4} display="flex" justifyContent="center">
                    <img src={"/basementMenuImage.png"} alt="Statistics Page"
                         style={{maxWidth: '80%', height: 'auto'}}/>
                </Box>
            </Box>
        </Container>
    );
}

export default AuthorizationPage;

