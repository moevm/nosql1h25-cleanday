import { createContext } from 'react';
import { AuthContextType } from './types'; // Импортируем тип

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
