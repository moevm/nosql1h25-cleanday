import * as React from 'react';
import {Navigate, Route, Routes} from 'react-router-dom';
import {protectedRoutes, publicRoutes} from './routes.tsx';
import ProtectedRoute from '@pages/routes/ProtectedRoute.tsx';

/**
 * `AppRoutes`: Функциональный компонент, определяющий маршрутизацию приложения.
 * Использует `react-router-dom` для сопоставления URL-адресов с соответствующими компонентами.
 *
 * @returns {JSX.Element} - Возвращает JSX-элемент, представляющий набор маршрутов.
 */
const AppRoutes = (): React.JSX.Element => {
    return (
        <Routes>
            {/* Публичные маршруты */}
            {publicRoutes.map((route) => (
                <Route key={route.path} path={route.path} element={route.element}>
                    {route.children && route.children.map((child) => (
                        <Route key={child.path} path={child.path} element={child.element}/>
                    ))}
                </Route>
            ))}

            {/* Защищённые маршруты */}
            <Route element={<ProtectedRoute/>}>
                {protectedRoutes.map((route) => (
                    <Route key={route.path} path={route.path} element={route.element}>
                        {route.children && route.children.map((child) => (
                            <Route key={child.path} path={child.path} element={child.element}/>
                        ))}
                    </Route>
                ))}
            </Route>

            {/* Неизвестные маршруты */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;
