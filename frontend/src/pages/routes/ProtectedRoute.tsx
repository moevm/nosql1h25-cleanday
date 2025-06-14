import React from 'react';
import {Navigate, useLocation, Outlet} from 'react-router-dom';

import {useAuth} from '@hooks/authorization/useAuth';

/**
 * ProtectedRoute: Компонент для защиты маршрутов, требующих авторизации.
 * Перенаправляет неавторизованных пользователей на страницу авторизации.
 *
 * @returns {JSX.Element} - Возвращает защищенный маршрут или перенаправление
 */
const ProtectedRoute: React.FC = (): React.JSX.Element => {
    const {isAuthenticated} = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        // Сохраняем текущий маршрут для редиректа после авторизации
        return <Navigate to="/" state={{from: location}} replace/>;
    }

    return <Outlet />;
};

export default ProtectedRoute;
