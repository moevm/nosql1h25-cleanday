import React from 'react';

import './Appbar.css';
import {
    AppBar, Avatar,
    Box, Button,
    IconButton,
    Toolbar,
} from '@mui/material';
import {Link, useNavigate, useLocation} from 'react-router-dom';
import {useAuth} from "../../pages/Menu/Menu.tsx";
import {ExitToApp} from "@mui/icons-material";


const Appbar = ({ }) => {
    const {isLoggedIn, username, UserLogoutToken} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const showAppbar = location.pathname !== "/" && location.pathname !== "/register" && location.pathname !== "/authorization";

    return (
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    height: 64,
                    backgroundColor: 'transparent',
                    color: 'black',
                    display: showAppbar && isLoggedIn ? 'flex' : 'none',
                }}
            >
                <Toolbar>
                    <Button
                        sx={{
                            color: 'Black',
                            height: '50px',
                            '&:hover': {
                                backgroundColor: '#65b69d',
                            },
                        }}
                        component={Link} to="/" color="success" >
                        <h2>Главная</h2>
                    </Button>
                    <Button
                        sx={{
                            color: 'Black',
                            height: '50px',
                            '&:hover': {
                                backgroundColor: '#65b69d',
                            },
                            backgroundColor: location.pathname == "/cleandays" ? '#f85e28':'transparent',
                            boxShadow: 'none',
                        }}
                        component={Link} to="/cleandays" variant="contained" color="success">
                        <h2>Субботники</h2>
                    </Button>
                    <Button
                        sx={{
                            color: 'Black',
                            height: '50px',
                            '&:hover': {
                                backgroundColor: '#65b69d',
                            },
                            backgroundColor: location.pathname == "/users" ? '#f85e28':'transparent',
                            boxShadow: 'none',
                        }}
                        component={Link} to="/users" variant="contained" color="success">
                        <h2>Пользователи</h2>
                    </Button>
                    <Button
                        sx={{
                            color: 'Black',
                            height: '50px',
                            '&:hover': {
                                backgroundColor: '#65b69d',
                            },
                            backgroundColor: location.pathname == "/statistics" ? '#f85e28':'transparent',
                            boxShadow: 'none',
                        }}
                        component={Link} to="/statistics" variant="contained" color="success">
                        <h2>Статистика</h2>
                    </Button>
                    <Box sx={{ flexGrow: 1 }} />
                    <Avatar style={{ marginRight: '10px' }}
                        // Аватар крепить сюда !!!
                    >{username.charAt(0).toUpperCase()}</Avatar>
                    <IconButton
                        size="large"
                        color="inherit"
                        sx={{ '&:focus': { outline: 'none' }, }}
                        onClick={() => {
                            UserLogoutToken();
                            navigate('/');  // Перенаправляем на главную после логаута
                        }}
                    >
                        <ExitToApp />
                    </IconButton>
                </Toolbar>
            </AppBar>
    );
}

export default Appbar;