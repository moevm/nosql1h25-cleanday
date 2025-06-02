import './CleandaysPage.css'

import React from 'react';
import {
    Box,
    TextField,
    InputAdornment,
    Button,
    FormControlLabel,
    Checkbox,
    Typography, Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import Notification from '../../components/Notification';
import {Cleanday, CleanDayTag} from "../../models/User.ts";
import {useNavigate} from "react-router-dom";


// TODO: Реализуйте запрос
/**
 * Моковые данные субботников для демонстрации.
 * Представляют собой массив объектов типа Cleanday с полной информацией о каждом субботнике.
 * В реальном приложении эти данные будут загружаться с сервера.
 */
const cleandayData: Cleanday[] = [
    {
        key: "CD-001",
        name: "Весенняя уборка парка",
        description: "Приглашаем всех на уборку центрального парка!",
        participant_count: 25,
        recommended_count: 30,
        city: "Москва",
        location: { address: "Парк Горького", instructions: "У центрального входа", key: 101, city: "Москва" },
        begin_date: "2025-04-15",
        end_date: "2025-04-15",
        organizer: "Иванов И.И.",
        organization: "Зеленый Город",
        area: 1500,
        tags: [CleanDayTag.TRASH_COLLECTING, CleanDayTag.LAWN_SETUP],
        status: "Завершен",
        requirements: ["Перчатки", "Удобная обувь"],
        created_at: "2025-04-01T10:00:00Z",
        updated_at: "2025-04-16T12:30:00Z",
    },
    {
        key: "CD-002",
        name: "Чистый берег реки",
        description: "Очистим берег реки от мусора вместе!",
        participant_count: 18,
        recommended_count: 20,
        city: "Санкт-Петербург",
        location: { address: "Набережная реки Фонтанки", instructions: "У моста Белинского", key: 205, city: "Санкт-Петербург" },
        begin_date: "2025-05-20",
        end_date: "2025-05-20",
        organizer: "Петрова А.С.",
        organization: "Эко-Патруль СПб",
        area: 800,
        tags: [CleanDayTag.TRASH_COLLECTING, CleanDayTag.WATERBODY_CLEANING],
        status: "Завершен",
        requirements: ["Резиновые сапоги", "Перчатки"],
        created_at: "2025-05-05T09:15:00Z",
        updated_at: "2025-05-21T14:00:00Z",
    },
    {
        key: "CD-003",
        name: "Посадка деревьев в сквере",
        description: "Присоединяйтесь к посадке молодых саженцев!",
        participant_count: 12,
        recommended_count: 15,
        city: "Новосибирск",
        location: { address: "Сквер у Оперного театра", instructions: "За главным зданием", key: 310, city: "Новосибирск" },
        begin_date: "2025-06-10",
        end_date: "2025-06-10",
        organizer: "Сидоров В.К.",
        organization: "Зеленый Новосибирск",
        area: 500,
        tags: [CleanDayTag.PLANTING],
        status: "Запланировано",
        requirements: ["Лопаты (если есть)"],
        created_at: "2025-05-25T11:30:00Z",
        updated_at: "2025-05-28T16:45:00Z",
    },
];


/**
 * CleandaysPage: Компонент страницы со списком субботников.
 * Отображает таблицу субботников с возможностью поиска, фильтрации
 * и перехода на страницу детального просмотра субботника.
 *
 * @returns {React.JSX.Element} - Возвращает JSX-элемент, представляющий страницу со списком субботников.
 */
export const CleandaysPage = (): React.JSX.Element => {
    // Состояние для хранения текста поискового запроса
    const [searchText, setSearchText] = React.useState('');

    // Состояние для фильтрации отображения предыдущих субботников
    const [showPrevious, setShowPrevious] = React.useState(false);

    // Состояние для фильтрации субботников с участием текущего пользователя
    const [showMyParticipation, setShowMyParticipation] = React.useState(false);

    // Состояния для отображения уведомлений
    const [notificationMessage, setNotificationMessage] = React.useState<string | null>(null);
    const [notificationSeverity, setNotificationSeverity] =
        React.useState<'success' | 'info' | 'warning' | 'error'>('success');

    // Хук для навигации между страницами приложения
    const navigate = useNavigate();

    /**
     * Обработчик нажатия на кнопку построения графика.
     * Отображает уведомление об успешном построении графика.
     */
    const handlePlotButtonClick = () => {
        setNotificationMessage('График построен успешно!');
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
     * Обработчик изменения состояния чекбокса "Предстоящие субботники".
     * Обновляет состояние showPrevious и отображает уведомление о смене режима отображения.
     *
     * @param {React.ChangeEvent<HTMLInputElement>} event - Событие изменения состояния чекбокса.
     */
    const handleShowPreviousChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setShowPrevious(event.target.checked);
        setNotificationMessage(
            `Отображение ${event.target.checked ? 'предыдущих' : 'актуальных'} субботников`,
        );
        setNotificationSeverity('info');
    };

    /**
     * Обработчик клика по строке таблицы.
     * Осуществляет переход на страницу детального просмотра выбранного субботника.
     *
     * @param {Cleanday} сleanday - Объект субботника, по которому был совершен клик.
     */
    const handleRowClick = React.useCallback((сleanday: Cleanday) => {
        navigate(`/cleandays/${сleanday.key}`);
    }, [navigate]);

    /**
     * Обработчик изменения состояния чекбокса "С моим участием".
     * Обновляет состояние showMyParticipation и отображает уведомление о смене режима отображения.
     *
     * @param {React.ChangeEvent<HTMLInputElement>} event - Событие изменения состояния чекбокса.
     */
    const handleMyParticipationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setShowMyParticipation(event.target.checked);
        setNotificationMessage(
            `Отображение субботников ${event.target.checked ? 'с моим участием' : 'всех'}`,
        );
        setNotificationSeverity('info');
    };

    /**
     * Определение столбцов таблицы субботников.
     * Описывает структуру и отображение данных в таблице MaterialReactTable.
     */
    const columns = React.useMemo<MRT_ColumnDef<Cleanday>[]>(
        () => [
            {
                accessorKey: 'key',
                header: 'ID',
                size: 70,
            },
            {
                accessorKey: 'name',
                header: 'Название',
            },
            {
                accessorFn: (row) => row.city,
                header: 'Город',
                id: 'city',
            },
            {
                accessorFn: (row) => row.location.address,
                header: 'Адрес',
                id: 'address',
            },
            {
                accessorKey: 'begin_date',
                header: 'Дата и время начала',
            },
            {
                accessorKey: 'end_date',
                header: 'Дата и время завершения',
            },
            {
                accessorKey: 'organization',
                header: 'Организация',
            },
            {
                accessorKey: 'organizer',
                header: 'Организатор',
            },
            {
                header: 'Тип',
                id: 'type',
                // Кастомное отображение тегов как компонентов Chip
                Cell: ({ row }) => (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {row.original.tags.map((tag) => (
                            <Chip key={tag} label={tag} size="small" />
                        ))}
                    </Box>
                ),
            },
            {
                header: 'Статус',
                accessorKey: 'status',
                // Кастомное отображение статуса с цветовым выделением
                Cell: ({ row }) => {
                    let color: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | undefined;
                    switch (row.original.status) {
                        case 'Запланировано':
                            color = 'primary';
                            break;
                        case 'Завершен':
                            color = 'success';
                            break;
                        case 'Отменен':
                            color = 'error';
                            break;
                        case 'Проходит':
                            color = 'info';
                            break;
                        case 'Перенесён':
                            color = 'warning';
                            break;
                        default:
                            break;
                    }
                    return <Chip label={row.original.status} size="small" color={color} />;
                },
            },
        ],
        [],
    );

    /**
     * Фильтрация данных субботников на основе текущих критериев фильтрации.
     * Применяет поиск по тексту, фильтрацию по дате и участию пользователя.
     */
    const filteredCleandayData = React.useMemo(() => {
        let data = cleandayData;

        // Фильтрация по тексту поиска
        if (searchText) {
            const lowerCaseSearchText = searchText.toLowerCase();
            data = cleandayData.filter((cleanday) =>
                Object.values(cleanday).some((value) => {
                    // Проверка вложенных объектов
                    if (typeof value === 'object' && value !== null) {
                        return Object.values(value).some((nestedValue) =>
                            String(nestedValue).toLowerCase().includes(lowerCaseSearchText),
                        );
                    }
                    // Проверка массивов
                    if (Array.isArray(value)) {
                        return value.some((item) => String(item).toLowerCase().includes(lowerCaseSearchText));
                    }
                    // Проверка простых значений
                    return String(value).toLowerCase().includes(lowerCaseSearchText);
                }),
            );
        }

        if (!showPrevious) {
            // В реальном приложении здесь была бы фильтрация по дате
            // Для этого примера мы просто показываем все для наглядности UI
        }

        if (showMyParticipation) {
            // В реальном приложении здесь была бы фильтрация по участию пользователя
        }

        return data;
    }, [searchText, showPrevious, showMyParticipation]);

    /**
     * Конфигурация таблицы MaterialReactTable.
     * Настраивает поведение, внешний вид и функциональность таблицы.
     */
    const table = useMaterialReactTable({
        columns,
        data: filteredCleandayData,
        enableColumnOrdering: false,
        enableRowSelection: false,
        enableSorting: true,
        enableColumnFilters: true,
        enableGlobalFilter: false,
        initialState: {
            density: "compact",
            pagination: { pageIndex: 0, pageSize: 10 },
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
                cursor: 'pointer',
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
        <Box className={"cleandays-box"}>
            {/* Заголовок и панель управления */}
            <Box>
                <Typography variant="h4" sx={{ margin: '10px 0px 0px 20px'  }}>
                    Субботники
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', margin: '10px 20px 0px 20px' }}>
                    {/* Поле поиска */}
                    <TextField
                        label="Поиск"
                        value={searchText}
                        onChange={handleSearchChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        size="small"
                        sx={{ mr: 2 }}
                    />
                    {/* Кнопка построения графика */}
                    <Button variant="outlined" onClick={handlePlotButtonClick} sx={{ml: "20px", color: 'black', borderColor: 'black'}}>
                        Построить график
                    </Button>
                    <Box sx={{flexGrow: 1}}/>
                    {/* Чекбоксы для фильтрации */}
                    <FormControlLabel
                        control={<Checkbox checked={showPrevious} onChange={handleShowPreviousChange} />}
                        label="Предстоящие субботники"
                    />
                    <FormControlLabel
                        control={<Checkbox checked={showMyParticipation} onChange={handleMyParticipationChange} />}
                        label="С моим участием"
                    />
                </Box>
            </Box>

            {/* Таблица субботников */}
            <MaterialReactTable
                table={table}
            />

            {/* Компонент уведомлений */}
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

export default CleandaysPage;