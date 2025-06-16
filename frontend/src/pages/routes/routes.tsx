import * as React from "react";

// Импорт компонентов страниц
import CleandaysPage from '@pages/protected/CleandaysPage/CleandaysPage.tsx';
import UsersPage from '@pages/protected/UsersPage/UsersPage.tsx';
import StatisticsPage from '@pages/protected/StatisticsPage/StatisticsPage.tsx';
import AuthorizationPage from '@pages/public/AuthorizationPage/AuthorizationPage.tsx'
import RegistrationPage from '@pages/public/RegistrationPage/RegistrationPage.tsx';
import UserProfilePage from "@pages/protected/UserProfilePage/UserProfilePage.tsx";
import MenuPage from "@pages/public/MenuPage/MenuPage.tsx";
import UserPage from "@pages/protected/UserPage/UserPage.tsx";
import CleandayPage from "@pages/protected/CleandayPage/CleandayPage.tsx";

/**
 * Интерфейс `RouteItem` определяет структуру элемента для роутинга.
 * @param {string} path - Путь маршрута (например, "/users").
 * @param {React.ReactNode} [element] - React-компонент, который будет отображаться при переходе по данному маршруту (необязательный).
 * @param {RouteItem[]} [children] - Массив дочерних маршрутов (необязательный).  Позволяет определять вложенные маршруты.
 */
export interface RouteItem {
    path: string;
    element: React.ReactNode;
    children?: RouteItem[];
}

// Определение открытых маршрутов
/**
 * Массив `publicRoutes` содержит конфигурацию открытых маршрутов приложения, доступных любому гостю или пользователю сайта.
 * Каждый объект в массиве соответствует одному маршруту и определяет его путь, дочерние маршруты и элемент, отображаемый по маршруту.
 */
export const publicRoutes: RouteItem[] = [
    {
        path: "/",
        element: <MenuPage/>,
    },
    {
        path: "/register",
        element: <RegistrationPage/>,
    },
    {
        path: "/authorization",
        element: <AuthorizationPage/>,
    },

];

// Определение закрытых маршрутов
/**
 * Массив `protectedRoutes` содержит конфигурацию закрытых маршрутов приложения, доступных только авторизованным пользователям.
 * Каждый объект в массиве соответствует одному маршруту и определяет его путь, дочерние маршруты и элемент, отображаемый по маршруту.
 */
export const protectedRoutes: RouteItem[] = [

    {
        path: "/users/:id",
        element: <UserPage/>,
    },
    {
        path: "/cleandays/:id",
        element: <CleandayPage/>,
    },
    {
        path: "/statistics",
        element: <StatisticsPage/>,
    },
    {
        path: "/users",
        element: <UsersPage/>,
    },
    {
        path: "/cleandays",
        element: <CleandaysPage/>,
    },
    {
        path: "/profile",
        element: <UserProfilePage/>,
    },
];
