import './index.css'

import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'

import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

import {BrowserRouter} from 'react-router-dom';

import App from './App.tsx'
import {AuthProvider} from '@contexts/authorization/AuthProvider.tsx';

// Устанавливаем русскую локаль как локаль по умолчанию
dayjs.locale('ru');

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <AuthProvider>
                        <App/>
                    </AuthProvider>
                </BrowserRouter>
            </QueryClientProvider>
        </LocalizationProvider>
    </StrictMode>,
)
