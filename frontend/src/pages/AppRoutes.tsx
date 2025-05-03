import * as React from 'react';

import { Route, Routes } from 'react-router-dom';
import {routes} from "./routes.tsx";

/**
 * `AppRoutes`: Функциональный компонент, определяющий маршрутизацию приложения.
 * Использует `react-router-dom` для сопоставления URL-адресов с соответствующими компонентами.
 *
 * @returns {JSX.Element} - Возвращает JSX-элемент, представляющий набор маршрутов, определенных в массиве `routes`.
 */
const AppRoutes = (): React.JSX.Element => {
    return (
        <Routes>
            {routes.map((route) => (
                <Route key={route.path} path={route.path} element={route.element}>
                    {route.children && route.children.map((child) => (
                        <Route key={child.path} path={child.path} element={child.element} />
                    ))}
                </Route>
            ))}
        </Routes>
    );
};

export default AppRoutes;