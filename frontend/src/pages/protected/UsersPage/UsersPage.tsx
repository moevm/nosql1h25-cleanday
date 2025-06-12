import './UsersPage.css'
import React from 'react';
import {Box, Button,} from '@mui/material';
import {MRT_ColumnDef, MRT_ColumnFiltersState, MRT_PaginationState, MRT_SortingState} from 'material-react-table';
import Notification from '@components/Notification.tsx';
import {useNavigate} from 'react-router-dom';
import {getStatusByLevel} from "@/utils/user/getStatusByLevel.ts";
import {useGetUsers} from "@hooks/user/useGetUsers.tsx";
import {GetUsersParams} from '@api/user/models';
import {User} from "@models/User.ts";
import {PaginatedTableWithTemplate} from '@components/PaginatedTable/PaginatedTable';
import {transformRangeFilters, transformStringFilters} from '@utils/filterUtils';
import {SortOrder} from "@api/BaseApiModel.ts";

/**
 * UsersPage: Компонент страницы для отображения списка пользователей.
 * Представляет таблицу пользователей с возможностью поиска, сортировки,
 * фильтрации и навигации на страницы отдельных пользователей.
 *
 * @returns {JSX.Element} - Возвращает JSX-элемент, представляющий страницу пользователей.
 */
const UsersPage: React.FC = (): React.JSX.Element => {
    // Состояния для отображения уведомлений
    const [notificationMessage, setNotificationMessage] = React.useState<string | null>(null);
    const [notificationSeverity, setNotificationSeverity] = React.useState<'success' | 'info' | 'warning' | 'error'>('success');

    // Хук для программной навигации между страницами
    const navigate = useNavigate();
    
    // Функция для создания хука запроса пользователей с указанными параметрами
    const getUsersQueryHook = React.useCallback((params: Record<string, unknown>) => {
        return useGetUsers(params as GetUsersParams);
    }, []);

    /**
     * Обработчик нажатия на кнопку построения графика.
     * Отображает уведомление об успешном построении графика.
     */
    const handlePlotButtonClick = () => {
        setNotificationMessage('График построен успешно!');
        setNotificationSeverity('success');
    };

    /**
     * Обработчик клика по строке таблицы.
     * Осуществляет переход на страницу детального просмотра выбранного пользователя.
     *
     * @param {User} user - Объект пользователя, по строке которого был совершен клик.
     */
    const handleRowClick = React.useCallback((user: User) => {
        navigate(`/users/${user.id}`);
    }, [navigate]);    /**
     * Функция для трансформации фильтров столбцов в параметры API
     */
    const transformFilters = React.useCallback((columnFilters: MRT_ColumnFiltersState): Record<string, any> => {
        // Карты соответствия между id столбцов и параметрами API
        const stringFilterMap = {
            'firstName': 'first_name',
            'lastName': 'last_name',
            'login': 'login',
            'city': 'city',
        };

        const fromFilterMap = {
            'participantsCount': 'cleandays_from',
            'cleaned': 'stat_from',
            'organizedCount': 'organized_from',
            'level': 'level_from',
        };

        const toFilterMap = {
            'participantsCount': 'cleandays_to',
            'cleaned': 'stat_to',
            'organizedCount': 'organized_to',
            'level': 'level_to',
        };

        // Трансформируем фильтры
        const stringParams = transformStringFilters(columnFilters, stringFilterMap);
        const rangeParams = transformRangeFilters(columnFilters, fromFilterMap, toFilterMap);

        return {
            ...stringParams,
            ...rangeParams,
        };
    }, []);/**
     * Определение столбцов таблицы пользователей.
     */
    const columns = React.useMemo<MRT_ColumnDef<User>[]>(() => [
        {
            accessorKey: 'firstName',
            header: 'Имя',
        },
        {
            accessorKey: 'lastName',
            header: 'Фамилия',
        },
        {
            accessorKey: 'login',
            header: 'Логин',
        },
        {
            accessorKey: 'city',
            header: 'Город',
        },
        {
            accessorKey: 'participantsCount',
            header: 'Посещённые субботники',
            filterVariant: 'range'
        },
        {
            accessorKey: 'cleaned',
            header: 'Убрано, м²',
            filterVariant: 'range'
        },
        {
            accessorKey: 'organizedCount',
            header: 'Организованные субботники',
            filterVariant: 'range'
        },
        {
            accessorKey: 'level',
            header: 'Уровень',
            Cell: ({row}: {row: any}) => (
                <span>{getStatusByLevel(row.original.level)}</span>
            ),
            filterVariant: 'range',
            //enableColumnFilter: true,
        },
    ], []);


    /**
     * Обработчик закрытия уведомления.
     */
    const handleNotificationClose = React.useCallback(() => {
        setNotificationMessage(null);
    }, [setNotificationMessage]);

    /**
     * Рендер кастомных действий в верхней панели инструментов
     */
    const renderTopToolbarCustomActions = React.useCallback(() => {
        return (
            <Box sx={{display: 'flex', width: '100%', justifyContent: 'flex-start'}}>
                <Button
                    variant="outlined"
                    onClick={handlePlotButtonClick}
                    sx={{color: 'black', borderColor: 'black'}}
                >
                    Построить график
                </Button>
            </Box>
        );
    }, []);    // Add this mapping object
    const columnToApiFieldMap: Record<string, string> = {
        'firstName': 'first_name',
        'lastName': 'last_name',
        'username': 'username',
        'email': 'email',
        'role': 'role',
        'status': 'status',
        // Add any other column mappings
    };

    // Update the createQueryParams function similar to above
    const createQueryParams = React.useCallback(
        (
            pagination: MRT_PaginationState,
            sorting: MRT_SortingState,
            columnFilters: MRT_ColumnFiltersState,
            globalFilter?: string
        ) => {
            const params: Record<string, unknown> = {
                offset: pagination.pageIndex * pagination.pageSize,
                limit: pagination.pageSize,
                search_query: globalFilter && globalFilter.trim() !== "" ? globalFilter.trim() : undefined,
            };

            if (sorting.length > 0) {
                // Get the column ID being sorted and map it to API field
                const sortColumnId = sorting[0].id;
                params.sort_by = columnToApiFieldMap[sortColumnId] || sortColumnId;
                params.sort_order = sorting[0].desc ? SortOrder.desc : SortOrder.asc;
            }

            // Add any other parameter transformations
            
            return params;
        },
        []
    );

    return (
        <Box className="user-box">
            <PaginatedTableWithTemplate
                title="Пользователи"
                columns={columns}
                getQueryHook={getUsersQueryHook}
                transformFilters={transformFilters as any}
                onRowClick={handleRowClick}
                renderTopToolbarCustomActions={renderTopToolbarCustomActions}
            />

            {/* Компонент уведомления */}
            {notificationMessage && (
                <Notification
                    message={notificationMessage}
                    severity={notificationSeverity}
                    onClose={handleNotificationClose}
                />
            )}
        </Box>
    );
};

export default UsersPage;
