import './app.css';

import * as React from 'react';

import {BrowserRouter as Router, Route, Routes, useLocation} from 'react-router-dom';
import Menu from './pages/Menu/Menu.tsx';
import AppRoutes from './pages/AppRoutes.tsx';
import {Box} from '@mui/material';
import {AuthProvider} from './pages/Menu/Menu.tsx';
import Appbar from "./components/layout/Appbar.tsx";


function AppContent() {

    return (
        <Box sx={{
            display: 'flex',
            mx: '10px',
            height: '100%',
            width: '95vw',
        }}>
            <Appbar/>
            <Routes>
                <Route path="/" element={<Menu/>}/>
                <Route path="*" element={<AppRoutes/>}/>
            </Routes>
        </Box>
    );
}

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <AppContent/>
            </Router>
        </AuthProvider>
    );
}

export default App;
