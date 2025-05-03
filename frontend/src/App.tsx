import './app.css';

import * as React from 'react';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Menu from './pages/Menu/Menu.tsx';
import AppRoutes from './pages/AppRoutes.tsx';
import { Box } from '@mui/material';
import { AuthProvider } from './pages/Menu/Menu.tsx';

const App = () => {
    return (
        <AuthProvider>
            <Box sx={{
                display: 'flex',
                mx: '10px',
                height: '100%',
                width: '95vw',
            }}>
                <Router>
                    <Routes>
                        <Route path="/" element={<Menu />} />
                        <Route path="*" element={<AppRoutes />} />
                    </Routes>
                </Router>
            </Box>
        </AuthProvider>
    );
}

export default App;
