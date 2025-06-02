import './app.css';

import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Menu from './pages/Menu/Menu.tsx';
import AppRoutes from './pages/AppRoutes.tsx';
import {Box} from '@mui/material';
import {AuthProvider} from './pages/Menu/Menu.tsx';
import Appbar from "./components/layout/Appbar.tsx";
import CleandayPage from "./pages/CleandayPage/CleandayPage.tsx";
import UserPage from "./pages/UserPage/UserPage.tsx";


function AppContent() {

    return (
        <Box sx={{
            display: 'flex',
            paddingTop: '64px',
            height: 'calc(100vh - 64px)',
            width: '99.99vw',
            backgroundPositionX: 'x-start',
            top: 0,
            right: 0,
        }}>
            <Appbar/>
            <Routes>
                <Route path="/" element={<Menu/>}/>
                <Route path="*" element={<AppRoutes/>}/>
                <Route path="/users/:id" element={<UserPage />} />
                <Route path="/cleandays/:id" element={<CleandayPage />} />
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
