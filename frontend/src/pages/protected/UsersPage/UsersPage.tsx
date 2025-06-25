import './UsersPage.css'
import React from 'react';
import {Box, Button,} from '@mui/material';
import {
    MRT_ColumnDef,
    MRT_ColumnFiltersState,
    MRT_PaginationState,
    MRT_SortingState
} from 'material-react-table';
import Notification from '@components/Notification.tsx';
import {useNavigate} from 'react-router-dom';
import {useGetUsers} from "@hooks/user/useGetUsers.tsx";
import {GetUsersParams} from '@api/user/models';
import {User} from "@models/User.ts";
import {PaginatedTable} from '@components/table/PaginatedTable/PaginatedTable';
import {transformNumericRangeFilters, transformStringFilters} from '@utils/filterUtils';
import {createQueryParams} from "@utils/api/createQueryParams.ts";
import {getNonNegativeNumberFilterProps} from "@utils/table/columns.tsx";
import UserHeatmapDialog from '@components/dialog/UserHeatmapDialog';

/**
 * UsersPage: Компонент страницы для отображения списка пользователей.
 * Представляет таблицу пользователей с возможностью поиска, сортировки,
 * фильтрации и навигации на страницы отдельных пользователей.
 *
 * @returns {React.JSX.Element} - Возвращает JSX-элемент, представляющий страницу пользователей.
 */
const UsersPage: React.FC = (): React.JSX.Element => {
    // Состояния для отображения уведомлений
    const [notificationMessage, setNotificationMessage] = React.useState<string | null>(null);
    const [notificationSeverity, setNotificationSeverity] = React.useState<'success' | 'info' | 'warning' | 'error'>('success');
    
    // State for heatmap dialog
    const [heatmapDialogOpen, setHeatmapDialogOpen] = React.useState(false);
    const [currentFilters, setCurrentFilters] = React.useState<Record<string, unknown>>({});
    
    // Use a ref to safely store filters without causing re-renders
    const filtersRef = React.useRef<Record<string, unknown>>({});

    // Хук для программной навигации между страницами
    const navigate = useNavigate();

    // Функция для создания хука запроса пользователей с указанными параметрами
    const getUsersQueryHook = React.useCallback((params: Record<string, unknown>) => {
        // всё работает как должно, не понимаю почему возникают ошибки от инлайнера
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useGetUsers(params as GetUsersParams);
    }, []);

    /**
     * Обработчик нажатия на кнопку построения графика.
     * Открывает диалог с тепловой картой пользователей и использует текущие фильтры.
     */
    const handlePlotButtonClick = () => {
        // Update state only when button is clicked, not during render
        setCurrentFilters({...filtersRef.current});
        setHeatmapDialogOpen(true);
    };

    /**
     * Обработчик клика по строке таблицы.
     * Осуществляет переход на страницу детального просмотра выбранного пользователя.
     *
     * @param {User} user - Объект пользователя, по строке которого был совершен клик.
     */
    const handleRowClick = (user: User) => {
        navigate(`/users/${user.id}`);
    };
    
    /**
     * Функция для трансформации фильтров столбцов в параметры API
     */
    const transformFilters = React.useCallback((columnFilters: MRT_ColumnFiltersState): Record<string, unknown> => {
        // Карты соответствия между id столбцов и параметрами API
        const stringFilterMap = {
            'firstName': 'first_name',
            'lastName': 'last_name',
            'login': 'login',
            'city': 'city',
        };

        const fromFilterMap = {
            'participantsCount': 'cleanday_count_from',
            'cleaned': 'stat_from',
            'organizedCount': 'organized_count_from',
            'level': 'level_from',
        };

        const toFilterMap = {
            'participantsCount': 'cleanday_count_to',
            'cleaned': 'stat_to',
            'organizedCount': 'organized_count_to',
            'level': 'level_to',
        };

        // Трансформируем фильтры
        const stringParams = transformStringFilters(columnFilters, stringFilterMap);
        const rangeParams = transformNumericRangeFilters(columnFilters, fromFilterMap, toFilterMap);

        const transformedFilters = {
            ...stringParams,
            ...rangeParams,
        };
        
        // Store in ref instead of setting state during render
        filtersRef.current = transformedFilters;
        
        return transformedFilters;
    }, []);
    
    /**
     * Определение столбцов таблицы пользователей.
     */
    const columns = React.useMemo<MRT_ColumnDef<User>[]>(() => [
        {
            accessorKey: 'firstName',
            header: 'Имя',
            filterVariant: 'text',
            size: 100,
        },
        {
            accessorKey: 'lastName',
            header: 'Фамилия',
            filterVariant: 'text',
            size: 140,
        },
        {
            accessorKey: 'login',
            header: 'Логин',
            filterVariant: 'text',
            size: 100,
        },
        {
            accessorKey: 'city',
            header: 'Город',
            size: 140,
        },
        {
            accessorKey: 'participantsCount',
            header: 'Посещённые субботники',
            filterVariant: 'range',
            size: 220,
            muiFilterTextFieldProps: getNonNegativeNumberFilterProps(),
        },
        {
            accessorKey: 'organizedCount',
            header: 'Организованные субботники',
            filterVariant: 'range',
            size: 220,
            muiFilterTextFieldProps: getNonNegativeNumberFilterProps(),
        },
        {
            accessorKey: 'cleaned',
            header: 'Убрано, м²',
            filterVariant: 'range',
            size: 220,
            muiFilterTextFieldProps: getNonNegativeNumberFilterProps(),
        },
        {
            accessorKey: 'level',
            header: 'Уровень',
            // Cell: ({row}: { row: MRT_Row<User> }) => (
            //     <span>{row.original.level}</span>
            // ),
            filterVariant: 'range',
            size: 220,
            muiFilterTextFieldProps: getNonNegativeNumberFilterProps(),
        },
    ], []);

    const columnToApiFieldMap: Record<string, string> = React.useMemo(() => ({
        'firstName': 'first_name',
        'lastName': 'last_name',
        'login': 'login',
        'sex': 'sex',
        'city': 'city',
        'aboutMe': 'about_me',
        'score': 'score',
        'level': 'level',
        'participantsCount': 'cleanday_count',
        'organizedCount': 'organized_count',
        'cleaned': 'stat',
    }), []);

    /**
     * Обработчик закрытия уведомления.
     */
    const handleNotificationClose = React.useCallback(() => {
        setNotificationMessage(null);
    }, [setNotificationMessage]);

    /**
     * Функция для получения текущих фильтров, используется для диалога с тепловой картой
     */
    const getCurrentFilters = React.useCallback((
        pagination: MRT_PaginationState,
        sorting: MRT_SortingState,
        columnFilters: MRT_ColumnFiltersState
    ) => {
        const transformedFilters = transformFilters(columnFilters);
        setCurrentFilters(transformedFilters);
        return transformedFilters;
    }, [transformFilters]);

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
    }, []);

    const createUsersQueryParams = React.useCallback(
        (
            pagination: MRT_PaginationState,
            sorting: MRT_SortingState,
            columnFilters: MRT_ColumnFiltersState,
            globalFilter?: string
        ): Record<string, unknown> => {
            return createQueryParams(
                pagination,
                sorting,
                columnFilters,
                globalFilter,
                columnToApiFieldMap,
                transformFilters
            );
        },
        [columnToApiFieldMap, transformFilters]
    );

    return (
        <Box className="user-box">
            <PaginatedTable
                title="Пользователи"
                columns={columns}
                getQueryHook={getUsersQueryHook}
                transformFilters={transformFilters}
                createQueryParams={createUsersQueryParams}
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

            {/* Heatmap Dialog */}
            <UserHeatmapDialog
                open={heatmapDialogOpen}
                onClose={() => setHeatmapDialogOpen(false)}
                currentFilters={currentFilters}
            />
        </Box>
    );
};

export default UsersPage;
