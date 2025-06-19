import './Appbar.css';

import React from 'react';

import {Link, useLocation} from 'react-router-dom';

import {AppBar, Avatar, Box, Button, IconButton, Toolbar,} from '@mui/material';

import {ExitToApp} from "@mui/icons-material";

import {CreateCleandayApiModel} from "@api/cleanday/models.ts";
import {useCreateCleanday} from "@hooks/cleanday/useCreateCleanday.tsx";

import {useAuth} from "@hooks/authorization/useAuth.tsx";
import {useGetMe} from "@hooks/authorization/useGetMe.tsx";
import {useGetUserAvatar} from "@hooks/user/useGetUserAvatar.tsx";

import CreateCleandayDialog from "../dialog/CreateCleandayDialog.tsx";
import LogoutConfirmationDialog from "../dialog/LogoutConfirmationDialog";



interface AppbarProps {
    open: boolean;
}

const Appbar = ({open}: AppbarProps): React.JSX.Element => {
    const {username, logout} = useAuth();
    const location = useLocation();
    
    // Get current user data to get the user ID
    const { data: currentUser } = useGetMe();
    
    // Fetch user avatar using the ID
    const { data: userAvatar } = useGetUserAvatar(currentUser?.id || '');
    
    // Determine avatar source - use the user's photo if available, otherwise undefined
    const avatarSrc = userAvatar && userAvatar.photo !== "default_image" 
        ? userAvatar.photo 
        : undefined;

    // Состояние открытия диалога для создания субботника
    const [cleandayDialogOpen, setCleandayDialogOpen] = React.useState(false);

    // Состояние для диалога подтверждения выхода
    const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);

    const { mutateAsync: createCleanday} = useCreateCleanday();

    // Updated function to use the API model and call the actual API
    const handleCleandaySubmit = (data: CreateCleandayApiModel) => {
        createCleanday(data)
            .then(() => {
                setCleandayDialogOpen(false);
                // You might want to show a success notification here
            })
            .catch((error) => {
                console.error('Error creating cleanday:', error);
                // You might want to show an error notification here
            });
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
                minWidth: 1000,
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
                    <h2>Создание субботника</h2>
                </Button>
                <Avatar 
                    style={{
                        marginRight: '10px', 
                        marginLeft: '10px',
                        width: '40px',
                        height: '40px'
                    }}
                    component={Link} 
                    to="/profile"
                    src={avatarSrc}
                />
                <IconButton
                    size="large"
                    color="inherit"
                    sx={{'&:focus': {outline: 'none'},}}
                    onClick={() => setLogoutDialogOpen(true)}
                >
                    <ExitToApp/>
                </IconButton>
            </Toolbar>
            {/* Диалог создания субботника */}
            <CreateCleandayDialog
                open={cleandayDialogOpen}
                onClose={() => setCleandayDialogOpen(false)}
                onSubmit={handleCleandaySubmit}
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


