import * as React from "react";
import { Route, Routes } from 'react-router-dom';

import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaic';
import PeopleIcon from "@mui/icons-material/People";
import LayersIcon from "@mui/icons-material/Layers";
import VisibilityIcon from "@mui/icons-material/Visibility";

// Импорт компонентов страниц
import CleandaysPage from './CleandaysPage/CleandaysPage.tsx';
import UsersPage from './UsersPage/UsersPage.tsx';
import StatisticsPage from './StatisticsPage/StatisticsPage.tsx';
import Authorization from './Authorization/Authorization.tsx'
import Registration from './Registration/Registration.tsx';

/**
 * Интерфейс `RouteItem` определяет структуру элемента для роутинга.
 * @param {string} path - Путь маршрута (например, "/users").
 * @param {string} label - Отображаемое название маршрута (например, "Пользователи").
 * @param {React.ReactNode} [icon] - React-компонент, представляющий иконку для маршрута (необязательный).
 * @param {React.ReactNode} [element] - React-компонент, который будет отображаться при переходе по данному маршруту (необязательный).
 * @param {RouteItem[]} [children] - Массив дочерних маршрутов (необязательный).  Позволяет определять вложенные маршруты.
 */
export interface RouteItem {
    path: string;
    label: string;
    icon?: React.ReactNode;
    element?: React.ReactNode;
    children?: RouteItem[];
}

// Определение маршрутов
/**
 * Массив `routes` содержит конфигурацию маршрутов приложения.
 * Каждый объект в массиве соответствует одному маршруту и определяет его свойства,
 * такие как путь, название, иконку и компонент для отображения.
 */
export const routes: RouteItem[] = [
    {
        path: "/statistics",
        label: "Статистика",
        icon: <AutoAwesomeMosaicIcon />,
        element: <StatisticsPage />,
    },
    {
        path: "/users",
        label: "Пользователи",
        icon: <PeopleIcon />,
        element: <UsersPage />,
    },
    {
        path: "/cleandays",
        label: "Субботники",
        icon: <LayersIcon />,
        element: <CleandaysPage />,
    },
    {
        path: "/register",
        label: "Регистрация",
        icon: <VisibilityIcon />,
        element: <Registration />,
    },
    {
        path: "/authorization",
        label: "Авторизация",
        icon: <VisibilityIcon />,
        element: <Authorization />,
    },
];

/**
 * `AppRoutes`: Функциональный компонент, определяющий маршрутизацию приложения.
 * Использует `react-router-dom` для сопоставления URL-адресов с соответствующими компонентами.
 *
 * @returns {JSX.Element} - Возвращает JSX-элемент, представляющий набор маршрутов, определенных в массиве `routes`.
 */
const AppRoutes = () => {
    return (
        <Routes>
            {routes.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
            ))}
        </Routes>
    );
};

export default AppRoutes;
