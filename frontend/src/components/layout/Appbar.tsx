import './Appbar.css';

import React from 'react';

import {Link} from 'react-router-dom';

import {AppBar, Avatar, Box, Button, IconButton, Toolbar,} from '@mui/material';

import {ExitToApp} from "@mui/icons-material";

import {CreateCleanday, Location} from "@models/deleteMeLater.ts";

import {useAuth} from "@hooks/authorization/useAuth.tsx";

import CreateCleandayDialog from "../dialog/CreateCleandayDialog.tsx";
import LogoutConfirmationDialog from "../dialog/LogoutConfirmationDialog";


const locationsMock: Location[] = [
    {
        address: 'Скверик',
        instructions: 'У фонтана',
        key: 1,
        city: 'Санкт-Петербург'
    },
    {
        address: 'Парк Победы',
        instructions: 'У главного входа',
        key: 2,
        city: 'Санкт-Петербург'
    }
];

interface AppbarProps {
    open: boolean;
}

const Appbar = ({open}: AppbarProps): React.JSX.Element => {
    const {username, logout} = useAuth();
    // const location = useLocation();
    // const showAppbar = location.pathname !== "/" && location.pathname !== "/register" && location.pathname !== "/authorization";

    // Состояние открытия диалога для создания субботника
    const [cleandayDialogOpen, setCleandayDialogOpen] = React.useState(false);

    // Состояние для диалога подтверждения выхода
    const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);

    // TODO: Реализуйте обработку создания субботника
    const handleCleandaySubmit = (data: CreateCleanday) => {
        // Например, сделать POST-запрос, добавить в список, обновить состояние и т.д.
        console.log('Создан субботник:', data);
    };

    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
                height: 64,
                backgroundColor: '#a9e3d4',
                color: 'black',
                display: open ? 'flex' : 'none',
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
                    component={Link} to="/" color="success">
                    <h2>Главная</h2>
                </Button>
                <Button
                    sx={{
                        color: 'Black',
                        height: '50px',
                        '&:hover': {
                            backgroundColor: '#65b69d',
                        },
                        backgroundColor: location.pathname == "/cleandays" ? '#f85e28' : 'transparent',
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
                        backgroundColor: location.pathname == "/users" ? '#f85e28' : 'transparent',
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
                        backgroundColor: location.pathname == "/statistics" ? '#f85e28' : 'transparent',
                        boxShadow: 'none',
                    }}
                    component={Link} to="/statistics" variant="contained" color="success">
                    <h2>Статистика</h2>
                </Button>
                <Box sx={{flexGrow: 1}}/>
                <Button
                    variant="outlined"
                    sx={{ml: "20px", height: '50px', color: 'black', borderColor: 'black'}}
                    onClick={() => setCleandayDialogOpen(true)}
                >
                    <h2>организация субботников</h2>
                </Button>
                <Avatar style={{marginRight: '10px', marginLeft: '10px'}}
                        component={Link} to="/profile"
                >{username.charAt(0).toUpperCase()}</Avatar>
                <IconButton
                    size="large"
                    color="inherit"
                    sx={{'&:focus': {outline: 'none'},}}
                    onClick={() => setLogoutDialogOpen(true)} // Открытие диалога подтверждения
                >
                    <ExitToApp/>
                </IconButton>
            </Toolbar>
            {/* Диалог создания субботника */}
            <CreateCleandayDialog
                open={cleandayDialogOpen}
                onClose={() => setCleandayDialogOpen(false)}
                onSubmit={handleCleandaySubmit}
                locations={locationsMock}
            />
            {/* Диалог подтверждения выхода */}
            <LogoutConfirmationDialog
                open={logoutDialogOpen}
                onClose={() => setLogoutDialogOpen(false)}
                onConfirm={logout}
            />
        </AppBar>
    );
}

export default Appbar;
