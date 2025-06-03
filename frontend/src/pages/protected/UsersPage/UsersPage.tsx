import './UsersPage.css'
import React from 'react';
import {
    Box,
    TextField,
    InputAdornment,
    Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import {MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef} from 'material-react-table';
import Notification from '@components/Notification.tsx';
import {User} from "@models/User.ts";
import Typography from "@mui/material/Typography";
import {useNavigate} from 'react-router-dom';

// TODO: Реализуйте запрос
/**
 * Моковые данные пользователей для демонстрации.
 * В реальном приложении этот массив будет загружаться с сервера через API-запрос.
 * Каждый объект представляет пользователя с базовой информацией и статистикой участия в субботниках.
 */
const userData: User[] = [
    {
        key: "1",
        first_name: "Alice",
        last_name: "Smith",
        login: "alice.s",
        city: "Milan",
        cleanday_count: 12,       // Количество субботников, в которых участвовал пользователь
        organized_count: 8,        // Количество организованных пользователем субботников
        level: 2,                  // Уровень пользователя
    },
    {
        key: "2",
        first_name: "Bob",
        last_name: "Johnson",
        login: "bob.j",
        city: "Rome",
        cleanday_count: 5,
        organized_count: 15,
        level: 1,
    },
    {
        key: "3",
        first_name: "Charlie",
        last_name: "Brown",
        login: "charlie.b",
        city: "Florence",
        cleanday_count: 20,
        organized_count: 10,
        level: 3,
    },
];

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

    /**
     * Функция для преобразования числового уровня пользователя в текстовое описание с эмодзи.
     * Используется для отображения статуса пользователя в таблице.
     *
     * @param {number} level - Числовой уровень пользователя.
     * @returns {string} - Текстовое представление уровня пользователя с эмодзи.
     */
    const getLevelStatus = React.useCallback((level: number) => {
        if (level == 1) {
            return 'Новичок👍';
        } else if (level == 2) {
            return 'Труженик💪';
        } else if (level == 3) {
            return 'Лидер района🤝';
        } else if (level == 4) {
            return 'Экоактивист🌱';
        } else if (level == 5) {
            return 'Экозвезда🌟';
        } else {
            return 'Эко-гуру🏆';
        }
    }, []);

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
     * @param {User} user - Объект пользователя, по строке которого был совершен клик.
     */
    const handleRowClick = React.useCallback((user: User) => {
        navigate(`/users/${user.key}`);
    }, [navigate]);

    /**
     * Определение столбцов таблицы пользователей.
     * Описывает структуру и отображение данных в таблице MaterialReactTable.
     */
    const columns = React.useMemo<MRT_ColumnDef<User>[]>(
        () => [
            {
                accessorKey: 'key',
                header: 'ID',
            },
            {
                id: 'user',
                header: 'User',
                // Кастомная ячейка для отображения имени и фамилии пользователя
                Cell: ({row}) => (
                    <span>{row.original.first_name} {row.original.last_name}</span>
                ),
                filterVariant: 'text',
            },
            {
                accessorKey: 'login',
                header: 'Login',
            },
            {
                accessorKey: 'city',
                header: 'City',
            },
            {
                accessorKey: 'cleanday_count',
                header: 'Area Cleaned, m²',
            },
            {
                accessorKey: 'organized_count',
                header: 'Organized Clean-ups',
            },
            {
                id: 'level',
                header: 'Level',
                // Кастомная ячейка для отображения уровня пользователя в текстовом виде
                Cell: ({row}) => (
                    <span>{getLevelStatus(row.original.level)}</span>
                ),
                filterVariant: 'text',
                enableColumnFilter: true,
            },
        ],
        [getLevelStatus],
    );

    /**
     * Фильтрация данных пользователей на основе текста поиска.
     * Возвращает массив пользователей, соответствующих поисковому запросу.
     */
    const filteredUserData = React.useMemo(() => {
        if (!searchText) {
            return userData;
        }
        const lowerCaseSearchText = searchText.toLowerCase();
        return userData.filter((user) =>
            Object.values(user).some((value) =>
                String(value).toLowerCase().includes(lowerCaseSearchText),
            ),
        );
    }, [searchText]);

    /**
     * Конфигурация таблицы MaterialReactTable.
     * Настраивает поведение, внешний вид и функциональность таблицы.
     */
    const table = useMaterialReactTable({
        columns,
        data: filteredUserData,
        enableCellActions: true,
        enableColumnOrdering: false,
        enableRowSelection: false,
        enableSorting: true,
        enableColumnFilters: true,
        enableGlobalFilter: false,
        initialState: {
            pagination: {pageIndex: 0, pageSize: 10},
        },
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