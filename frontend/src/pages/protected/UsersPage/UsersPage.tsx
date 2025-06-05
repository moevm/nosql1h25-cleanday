import './UsersPage.css'
import React, {useEffect, useState} from 'react';
import {Box, Button, InputAdornment, TextField,} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import {
    MaterialReactTable,
    type MRT_ColumnDef,
    MRT_ColumnFiltersState,
    MRT_PaginationState,
    MRT_SortingState, MRT_Updater,
    useMaterialReactTable
} from 'material-react-table';
import Notification from '@components/Notification.tsx';
import {DeleteMeLater} from "@models/deleteMeLater.ts";
import Typography from "@mui/material/Typography";
import {useNavigate} from 'react-router-dom';
import {getStatusByLevel} from "@/utils/user/getStatusByLevel.ts";
import {useGetUsers} from "@hooks/user/useGetUsers.tsx";
import {GetUsersParams} from '@api/user/models';
import {SortOrder} from "@api/BaseApiModel.ts";
import {User} from "@models/User.ts";
import {MRT_Localization_RU} from "material-react-table/locales/ru";

const userData = [];

/**
 * UsersPage: Компонент страницы для отображения списка пользователей.
 * Представляет таблицу пользователей с возможностью поиска, сортировки,
 * фильтрации и навигации на страницы отдельных пользователей.
 *
 * @returns {JSX.Element} - Возвращает JSX-элемент, представляющий страницу пользователей.
 */
const UsersPage: React.FC = (): React.JSX.Element => {
    // Состояние для хранения текста поискового запроса
    const [searchText, setSearchText] = React.useState('');

    // Состояния для отображения уведомлений
    const [notificationMessage, setNotificationMessage] = React.useState<string | null>(null);
    const [notificationSeverity, setNotificationSeverity] = React.useState<'success' | 'info' | 'warning' | 'error'>('success');

    // Хук для программной навигации между страницами
    const navigate = useNavigate();

    const [pagination, setPagination] = useState<MRT_PaginationState>({
        pageIndex: 0, pageSize: 10,
    });

    const [sorting, setSorting] = useState<MRT_SortingState>([]);

    const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([]);

    const [globalFilter, setGlobalFilter] = useState<string | undefined>(undefined);

    const [getUsersParams, setGetUsersParams] = useState<GetUsersParams>({
        offset: pagination.pageIndex * pagination.pageSize, limit: pagination.pageSize,
    });

    useEffect((): void => {
        const params: GetUsersParams = {
            offset: pagination.pageIndex * pagination.pageSize,
            limit: pagination.pageSize,
            search_query: globalFilter && globalFilter.trim() !== "" ? globalFilter.trim() : undefined,
        };

        if (sorting.length > 0) {
            params.sort_by = sorting[0].id;
            params.sort_order = sorting[0].desc ? SortOrder.desc : SortOrder.asc;
        } else {
            params.sort_by = undefined;
            params.sort_order = undefined;
        }

        columnFilters.forEach(filter => {
            const filterId = filter.id;
            const filterValue = filter.value;

            switch (filterId) {
                case 'firstName':
                    params.first_name = String(filterValue);
                    break;

                case 'lastName':
                    params.last_name = String(filterValue);
                    break;

                case 'login':
                    params.login = String(filterValue);
                    break;

                case 'city':
                    params.city = String(filterValue);
                    break;

                case 'participantsCount':
                    if (filterValue && typeof filterValue === 'object') {
                        const range = filterValue as { min?: number; max?: number };
                        if (typeof range.min === 'number') {
                            params.cleandays_from = String(range.min);
                        }
                        if (typeof range.max === 'number') {
                            params.cleandays_to = String(range.max);
                        }
                    }
                    break;

                case 'cleaned':
                    if (filterValue && typeof filterValue === 'object') {
                        const range = filterValue as { min?: number; max?: number };
                        if (typeof range.min === 'number') {
                            params.stat_from = String(range.min);
                        }
                        if (typeof range.max === 'number') {
                            params.stat_to = String(range.max);
                        }
                    }
                    break;

                case 'organizedCount':
                    if (filterValue && typeof filterValue === 'object') {
                        const range = filterValue as { min?: number; max?: number };
                        if (typeof range.min === 'number') {
                            params.organized_from = String(range.min);
                        }
                        if (typeof range.max === 'number') {
                            params.organized_to = String(range.max);
                        }
                    }
                    break;

                case 'level':
                    if (filterValue && typeof filterValue === 'object') {
                        const range = filterValue as { min?: number; max?: number };
                        if (typeof range.min === 'number') {
                            params.level_from = String(range.min);
                        }
                        if (typeof range.max === 'number') {
                            params.level_to = String(range.max);
                        }
                    }
                    break;
            }
        });
        setGetUsersParams(params);
    }, [pagination.pageIndex, pagination.pageSize, sorting, columnFilters, globalFilter,]);

    const handleSortingChange = (updaterOrValue: MRT_Updater<MRT_SortingState>): void => {
        setSorting(updaterOrValue);
        setPagination(prev => ({...prev, pageIndex: 0}));
    };

    const handleColumnFiltersChange = (updaterOrValue: MRT_Updater<MRT_ColumnFiltersState>): void => {
        setColumnFilters(updaterOrValue);
        setPagination(prev => ({...prev, pageIndex: 0}));
    };

    const handleGlobalFilterChange = (value: string | undefined): void => {
        setGlobalFilter(value);
        setPagination(prev => ({...prev, pageIndex: 0}));
    }

    const {
        data,
        isError: isLoadingUsersError,
        isFetching: isFetchingUsers,
        isLoading: isLoadingUsers,
        error: loadingUsersError,
    } = useGetUsers(getUsersParams);

    const fetchedUsers = data?.users ?? [];
    const totalRowCount = data?.totalCount ?? 0;


    /**
     * Обработчик нажатия на кнопку построения графика.
     * Отображает уведомление об успешном построении графика.
     * В реальном приложении здесь был бы функционал для генерации и отображения графиков.
     */
    const handlePlotButtonClick = () => {
        setNotificationMessage('Graph generated successfully!');
        setNotificationSeverity('success');
    };

    /**
     * Обработчик изменения текста в поле поиска.
     * Обновляет состояние searchText, что приводит к фильтрации данных в таблице.
     *
     * @param {React.ChangeEvent<HTMLInputElement>} event - Событие изменения значения поля ввода.
     */
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value);
    };

    /**
     * Обработчик клика по строке таблицы.
     * Осуществляет переход на страницу детального просмотра выбранного пользователя.
     *
     * @param {DeleteMeLater} user - Объект пользователя, по строке которого был совершен клик.
     */
    const handleRowClick = React.useCallback((user: DeleteMeLater) => {
        navigate(`/users/${user.key}`);
    }, [navigate]);

    /**
     * Определение столбцов таблицы пользователей.
     * Описывает структуру и отображение данных в таблице MaterialReactTable.
     */
    const columns = React.useMemo<MRT_ColumnDef<User>[]>(
        () => [
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
                // Кастомная ячейка для отображения уровня пользователя в текстовом виде
                Cell: ({row}) => (
                    <span>{getStatusByLevel(row.original.level)}</span>
                ),
                filterVariant: 'range',
                enableColumnFilter: true,
            },
        ],
        [],
    );

    /**
     * Фильтрация данных пользователей на основе текста поиска.
     * Возвращает массив пользователей, соответствующих поисковому запросу.
     */
    // const filteredUserData = React.useMemo(() => {
    //     if (!searchText) {
    //         return userData;
    //     }
    //     const lowerCaseSearchText = searchText.toLowerCase();
    //     return userData.filter((user) =>
    //         Object.values(user).some((value) =>
    //             String(value).toLowerCase().includes(lowerCaseSearchText),
    //         ),
    //     );
    // }, [searchText]);

    /**
     * Конфигурация таблицы MaterialReactTable.
     * Настраивает поведение, внешний вид и функциональность таблицы.
     */
    const table = useMaterialReactTable({
        columns,
        data: ,

        localization: MRT_Localization_RU,

        enableCellActions: true,
        enableColumnOrdering: false,
        enableRowSelection: false,
        enableSorting: true,
        enableColumnFilters: true,
        enableGlobalFilter: false,

        // state: {
        //
        // }

        muiTablePaperProps: {
            elevation: 0,
            sx: {
                border: 'none',
                borderRadius: '0',
            },
        },
        muiTableProps: {
            sx: {
                tableLayout: 'fixed',
                cursor: 'pointer', // Указывает, что строки можно кликать
            },
        },
        // Настройка обработчика клика по строке для перехода к детальному просмотру
        muiTableBodyRowProps: ({row}) => ({
            onClick: () => handleRowClick(row.original),
        }),
        muiPaginationProps: {
            rowsPerPageOptions: [5, 10],
        },
    });

    /**
     * Обработчик закрытия уведомления.
     * Очищает сообщение уведомления, что приводит к его скрытию.
     */
    const handleNotificationClose = React.useCallback(() => {
        setNotificationMessage(null);
    }, [setNotificationMessage]);

    return (
        <Box className={"user-box"}>
            {/* Заголовок и панель управления */}
            <Box>
                <Typography className={"user-typo"} variant="h4" color={'Black'} sx={{margin: '10px 0px 0px 20px'}}>
                    Пользователи
                </Typography>
                <Box sx={{display: 'flex', alignItems: 'center', margin: '10px 20px 0px 20px'}}>
                    {/* Поле поиска пользователей */}
                    <TextField
                        label="Поиск"
                        value={searchText}
                        onChange={handleSearchChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon/>
                                </InputAdornment>
                            ),
                        }}
                        size="small"
                        sx={{mr: 2}}
                    />
                    {/* Кнопка построения графика */}
                    <Button variant="outlined" onClick={handlePlotButtonClick}
                            sx={{ml: "20px", color: 'black', borderColor: 'black'}}>
                        Построить график
                    </Button>
                </Box>
            </Box>

            {/* Таблица пользователей */}
            <MaterialReactTable
                table={table}
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