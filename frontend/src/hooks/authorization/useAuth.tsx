import {useContext} from 'react';
import {AuthContext} from '@contexts/authorization/context'; // Импортируем контекст
import {AuthContextType} from '@contexts/authorization/types'; // Импортируем тип

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth должен использоваться внутри AuthProvider');
    }
    return context;
};


