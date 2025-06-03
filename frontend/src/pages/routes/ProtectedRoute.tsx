import React from 'react';

import {Navigate, Outlet, useLocation} from 'react-router-dom';

import {Box, CircularProgress} from '@mui/material';

import {useAuth} from '@hooks/authorization/useAuth';

interface ProtectedRouteProps {
    children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({children}) => {
    const {isAuthenticated, isLoading} = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
                <CircularProgress/>
            </Box>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" state={{from: location}} replace/>;
    }

    return children ? <>{children}</> : <Outlet/>;
};

export default ProtectedRoute;
