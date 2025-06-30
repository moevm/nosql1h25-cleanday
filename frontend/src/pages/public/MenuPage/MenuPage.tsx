import './MenuPage.css';

import * as React from 'react';

import {Link, useNavigate} from 'react-router-dom';

import {AppBar, Avatar, Box, Button, Container, IconButton, Toolbar, Typography} from '@mui/material';

import {ExitToApp} from '@mui/icons-material';

import LogoutConfirmationDialog from "@components/dialog/LogoutConfirmationDialog.tsx";
import {useAuth} from "@hooks/authorization/useAuth.tsx";
import {useGetMe} from "@hooks/authorization/useGetMe.tsx";
import {useGetUserAvatar} from "@hooks/user/useGetUserAvatar.tsx";


/**
 * `MenuPage`: Функциональный компонент, представляющий меню приложения.
 * Отображает панель навигации с кнопками для перехода между страницами и кнопками аутентификации.
 * Использует хук `useAuth` для получения данных аутентификации и хук `useNavigate` для навигации.
 *
 * @returns {JSX.Element} - Возвращает JSX-элемент, представляющий меню приложения.
 */

export const MenuPage = (): React.JSX.Element => {
    const {isAuthenticated, username, logout} = useAuth();
    const navigate = useNavigate(); // Используем useNavigate

    // Get current user data to get the user ID
    const { data: currentUser } = useGetMe();
    
    // Fetch user avatar using the ID
    const { data: userAvatar } = useGetUserAvatar(currentUser?.id || '');
    
    // Determine avatar source - use the user's photo if available, otherwise undefined
    const avatarSrc = userAvatar && userAvatar.photo !== "default_image" 
        ? userAvatar.photo 
        : undefined;

    // Состояние для диалога подтверждения выхода
    const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);

    return (
        <div className="menuContainer">
            <Typography color={'#345e51'} variant="h4" fontWeight="bold" minWidth={'400px'}>Вместе — к чистой планете! </Typography>
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
                {isAuthenticated && (
                    <Toolbar>
                        <Box sx={{flexGrow: 1}}/>
                        <Avatar 
                            style={{
                                marginRight: '10px',
                                width: '40px',
                                height: '40px'
                            }}
                            src={avatarSrc}
                            onClick={() => {
                                navigate('/profile');
                            }}
                        />
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
            <Toolbar sx={{borderRadius: '8%'}} className="menuToolbar">
                <Box className="toolbarContent">
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
                            disabled={!isAuthenticated}
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
                            disabled={!isAuthenticated}
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
                            disabled={!isAuthenticated}
                            component={Link} to="/statistics" variant="contained" color="success">
                            <h2>Статистика</h2>
                        </Button>
                    </Box>

                    {/* Кнопки аутентификации */}
                    {!isAuthenticated && (
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
                    <img src={"/basementMenuImage.png"} alt="Statistics Page" style={{maxWidth: '100%', height: 'auto'}}/>
                </Box>
            </Container>
            {/* Диалог подтверждения выхода */}
            <LogoutConfirmationDialog
                open={logoutDialogOpen}
                onClose={() => setLogoutDialogOpen(false)}
                onConfirm={logout}
            />
        </div>
    );
}

export default MenuPage;

