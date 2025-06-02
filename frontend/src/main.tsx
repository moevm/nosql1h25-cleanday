import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import dayjs, {Dayjs} from 'dayjs';
import App from './App.tsx'

import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
     <LocalizationProvider dateAdapter={AdapterDayjs}>
        <QueryClientProvider client={queryClient}>
          <App/>
        </QueryClientProvider>
      </LocalizationProvider>
  </StrictMode>,
)
