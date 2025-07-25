import './App.css';

import {Route, Routes, useLocation} from 'react-router-dom';

import {Box} from '@mui/material';

import AppRoutes from '@pages/routes/AppRoutes.tsx';

import Appbar from "./components/layout/Appbar.tsx";

import {useAuth} from "@hooks/authorization/useAuth.tsx";


const App = () => {
    const {isAuthenticated} = useAuth();
    const location = useLocation();

    return (
        <Box sx={{
            display: 'flex',
            paddingTop: '64px',
            height: 'calc(100vh - 65px)',
            width: '99.99vw',
            backgroundPositionX: 'x-start',
            top: 0,
            right: 0,
        }}>
            <Appbar open={isAuthenticated && location.pathname !== '/'}/>
            <Routes>
                <Route path="*" element={<AppRoutes/>}/>
            </Routes>
        </Box>
    );
}

export default App;
