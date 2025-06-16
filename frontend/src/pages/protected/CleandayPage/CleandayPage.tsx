import './CleandayPage.css';

import React from 'react';

import {Link} from "react-router-dom";

import {
    Box,
    Button,
    Chip,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Step,
    StepLabel,
    Stepper,
    TextField,
    Typography,
} from '@mui/material';

import SendIcon from '@mui/icons-material/Send';
import ArrowLeft from '@mui/icons-material/ArrowLeft';
import ArrowRight from '@mui/icons-material/ArrowRight';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import Notification from '@components/Notification.tsx';

import {
    CleanDayTag,
    Cleanday,
    CleandayComments,
    CleandayPics,
    Comment,
    Location,
    Requirement,
    ParticipationStatus,
    Participant,
    ParticipantStatus,
    CompletionData,
    CleandayResults
} from "@models/deleteMeLater.ts";

import EditCleandayDialog from '@components/dialog/EditCleandayDialog.tsx';
import ParticipationDialog from "@components/dialog/ParticipationDialog.tsx";
import CleandayCompletionDialog from "@components/dialog/CleandayCompletionDialog.tsx";
import ViewCleandayResultsDialog from '@components/dialog/ViewCleandayResultsDialog.tsx';
import CancelCleandayDialog from '@/components/dialog/CancelCleandayDialog';
import CleandayHistoryDialog, { CleanDayHistoryEntry } from '@/components/dialog/CleandayHistoryDialog';
import CleandayParticipantsDialog, { CleandayParticipant } from '@/components/dialog/CleandayParticipantsDialog';

// TODO: Реализуйте запрос
/**
 * Моковые данные для отображения информации о субботнике.
 * Заменить на реальную загрузку данных с сервера при интеграции с API.
 */
const mockCleanup: Cleanday = {
    key: '1',
    name: 'Уборка сквера',
    description: 'Приглашаем всех желающих принять участие в уборке нашего любимого сквера! Сделаем его чище вместе.',
    participant_count: 15,
    recommended_count: 20,
    city: 'Санкт-Петербург',
    location: {
        address: 'Малая Монетная 52',
        instructions: 'Встречаемся у центрального входа',
        key: 1,
        city: 'Санкт-Петербург',
    },
    begin_date: '2025-03-12T00:12:00Z',
    end_date: '2025-03-12T00:16:00Z',
    organizer: 'Иванов И.И.',
    organization: 'ЭкоДвижение',
    area: 500,
    tags: [CleanDayTag.TRASH_COLLECTING, CleanDayTag.TRASH_SORTING, CleanDayTag.LEAF_CLEANING, CleanDayTag.GAMES_AND_CONTESTS, CleanDayTag.PLANT_CARE],
    status: 'Запланировано',
    requirements: ['Перчатки', 'Хорошее настроение'],
    created_at: '2025-03-10T00:12:00Z',
    updated_at: '2025-03-10T00:12:00Z',
};

// TODO: Реализуйте запрос
// Mock data for CleandayResults
const mockCleandayResults: CleandayResults = {
    id: 1,
    name: 'Уборка сквера',
    date: '2025-03-12',
    location: 'Малая Монетная 52, Санкт-Петербург',
    results: ['Собрано 10 мешков мусора', 'Посажено 5 деревьев'],
    photos: ['/img_1.png', '/img_2.png', '/img_3.png', '/img_4.png'],
    participantsCount: 15,
};


// TODO: Реализуйте запрос
/**
 * Моковые данные для отображения изображений субботника.
 */
const mockCleanupPics: CleandayPics = {
    Images: [
        {key: '1', description: 'Пройти тут', photo: '/img_1.png'},
        {key: '2', description: 'Еще фото', photo: '/img_2.png'},
        {key: '3', description: 'И еще одно', photo: '/img_3.png'},
        {key: '4', description: 'Фото 4', photo: '/img_4.png'},
    ],
};


// TODO: Реализуйте запрос
/**
 * Моковые данные для отображения комментариев к субботнику.
 */
const mockComments: CleandayComments = {
    comments:
        [{
            author: 'Имя Фамилия',
            text: 'Очень крутой субботник, люблю убирать скверы',
            date: '2025-03-12T10:45',
            key: 'c1'
        },
            {author: 'Имя Фамилия', text: 'Присоединюсь!', date: '2025-03-12T10:45', key: 'c2'},
        ]
};


// TODO: Реализуйте запрос
/**
 * Моковые данные для выбора локаций в диалоге редактирования.
 */
const mockLocations: Location[] = [
    {
        address: 'Скверик',
        instructions: 'У фонтана',
        key: 1,
        city: 'Санкт-Петербург'
    },
    {
        address: 'Парк Победы',
        instructions: 'У главного входа',
        key: 2,
        city: 'Санкт-Петербург'
    }
];

/**
 * CleandayPage: Компонент страницы отображения подробной информации о субботнике.
 * Отображает детальную информацию, комментарии, фотографии и предоставляет функционал
 * для редактирования и управления субботником.
 *
 * @returns {JSX.Element} - Возвращает JSX-элемент, представляющий страницу субботника.
 */
const CleandayPage: React.FC = (): React.JSX.Element => {
    // Состояние для хранения информации о субботнике
    const [cleanup, setCleanup] = React.useState<Cleanday>(mockCleanup);

    // Состояние для хранения изображений субботника
    const [cleanupPics, setCleanupPics] = React.useState<CleandayPics>(mockCleanupPics);

    // Состояние для хранения комментариев к субботнику
    const [comments, setComments] = React.useState<CleandayComments>(mockComments);

    // Состояние для ввода нового комментария
    const [newComment, setNewComment] = React.useState('');

    // Состояния для отображения уведомлений
    const [notificationMessage, setNotificationMessage] = React.useState<string>('');
    const [notificationSeverity, setNotificationSeverity] = React.useState<'success' | 'info' | 'warning' | 'error'>('success');

    // Состояние для хранения индекса отображаемого фото
    const [currentPhotoIndex, setCurrentPhotoIndex] = React.useState(0);

    // Состояния для диалога требований
    const [openReqDialog, setOpenReqDialog] = React.useState(false);
    const [selectedRequirement, setSelectedRequirement] = React.useState<string | null>(null);

    // Состояние для диалога редактирования субботника
    const [editOpen, setEditOpen] = React.useState(false);

    /**
     * Обработчик открытия диалога редактирования субботника.
     */
    const handleEditOpen = () => setEditOpen(true);

    /**
     * Обработчик закрытия диалога редактирования субботника.
     */
    const handleEditClose = () => setEditOpen(false);


    // TODO: Реализуйте запрос
    /**
     * Обработчик сохранения изменений в субботнике.
     * Обновляет данные субботника и отображает уведомление об успехе.
     *
     * @param {Cleanday} updatedCleanday - Обновленные данные субботника.
     */
    const handleEditSave = (updatedCleanday: Cleanday) => {
        setCleanup(updatedCleanday);
        setEditOpen(false);
        showNotification('Изменения сохранены', 'success');
    };

    /**
     * Функция для отображения уведомления.
     *
     * @param {string} message - Текст уведомления.
     * @param {'success' | 'info' | 'warning' | 'error'} severity - Тип уведомления.
     */
    const showNotification = React.useCallback((message: string, severity: 'success' | 'info' | 'warning' | 'error') => {
        setNotificationMessage(message);
        setNotificationSeverity(severity);
    }, [setNotificationMessage, setNotificationSeverity]);

    /**
     * Обработчик закрытия уведомления.
     */
    const handleNotificationClose = React.useCallback(() => {
        setNotificationMessage('');
    }, [setNotificationMessage]);

    const [participationDialogOpen, setParticipationDialogOpen] = React.useState(false);
    const [participationRequirements] = React.useState<Requirement[]>([
        {id: 1, name: 'Перчатки'},
        {id: 2, name: 'Хорошее настроение'},
    ]);
    const [participationStatus, setParticipationStatus] = React.useState<ParticipationStatus>(ParticipationStatus.GOING);
    const [participationSelectedRequirements, setParticipationSelectedRequirements] = React.useState<number[]>([1]);

    const handleParticipationDialogOpen = () => {
        setParticipationDialogOpen(true);
    };

    // Close ParticipationDialog
    const handleParticipationDialogClose = () => {
        setParticipationDialogOpen(false);
    };

    // Handle submission from ParticipationDialog
    const handleParticipationSubmit = (data: { status: ParticipationStatus; selectedRequirements: number[] }) => {
        setParticipationStatus(data.status);
        setParticipationSelectedRequirements(data.selectedRequirements);
        setNotificationMessage('Участие успешно обновлено');
        setNotificationSeverity('success');
        setParticipationDialogOpen(false);
    };

    const [completionDialogOpen, setCompletionDialogOpen] = React.useState(false);

    // Mock participants for the dialog
    const participants: Participant[] = [
        { id: 1, firstName: 'Иван', lastName: 'Иванов', username: 'ivanov', status: ParticipantStatus.UNKNOWN },
        { id: 2, firstName: 'Мария', lastName: 'Смирнова', username: 'smirnova', status: ParticipantStatus.UNKNOWN },
        { id: 3, firstName: 'Пётр', lastName: 'Петров', username: 'petrov', status: ParticipantStatus.UNKNOWN },
    ];

    // Handler to open the completion dialog
    const handleOpenCompletionDialog = () => {
        setCompletionDialogOpen(true);
    };

    // Handler to close the completion dialog
    const handleCloseCompletionDialog = () => {
        setCompletionDialogOpen(false);
    };

    // Handler for submitting completion data
    const handleSubmitCompletionData = (data: CompletionData) => {
        console.log('Completion Data:', data);
        setNotificationMessage('Субботник успешно завершен!');
        setNotificationSeverity('success');
        setCompletionDialogOpen(false);
    };

    /**
     * Обработчик добавления нового комментария.
     * Проверяет наличие текста в комментарии и добавляет его в список.
     */
    const handleAddComment = () => {
        if (newComment.trim()) {
            // Создание нового комментария с текущими данными
            const comment: Comment = {
                key: Date.now().toString(),
                author: 'Вы',
                text: newComment.trim(),
                date: new Date().toISOString(),
            };

            // Добавление комментария в начало списка
            setComments((prevComments) => ({
                comments: [comment, ...(prevComments.comments || [])],
            }));

            // Очистка поля ввода и отображение уведомления
            setNewComment('');
            showNotification('Комментарий добавлен', 'success');
        } else {
            // Отображение предупреждения, если комментарий пустой
            showNotification('Пожалуйста, введите комментарий', 'warning');
        }
    };

    /**
     * Обработчик переключения на следующее фото в галерее.
     * Циклически перебирает фотографии в массиве.
     */
    const handleNextPhoto = () => {
        setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % cleanupPics.Images.length);
    };

    /**
     * Обработчик переключения на предыдущее фото в галерее.
     * Циклически перебирает фотографии в массиве.
     */
    const handlePrevPhoto = () => {
        setCurrentPhotoIndex((prevIndex) => (prevIndex - 1 + cleanupPics.Images.length) % cleanupPics.Images.length);
    };

    /**
     * Обработчик клика по полю с количеством участников.
     * Отображает уведомление о показе списка участников.
     */
    const handleClick = () => {
        handleParticipantsDialogOpen();
    }

    /**
     * Функция для определения числового значения статуса субботника.
     * Используется для отображения прогресса в Stepper-компоненте.
     *
     * @param {Cleanday['status']} status - Статус субботника.
     * @returns {number} - Числовое значение статуса (индекс шага).
     */
    const getStatusStep = (status: Cleanday['status']): number => {
        switch (status) {
            case 'Запланировано':
                return 0;
            case 'Проходит':
                return 1;
            case 'Завершен':
                return 2;
            case 'Отменен':
            case 'Перенесён':
            default:
                return -1;
        }
    };

    /**
     * Массив шагов для отображения в Stepper-компоненте.
     * Отображает статусы жизненного цикла субботника с датами.
     */
    const statusSteps = [
        {label: 'Запланирован', date: '10.03.2025 - 10:11'},
        {label: 'Проходит', date: '~12.03.2025 - 12:00'},
        {label: 'Завершен', date: '~12.03.2025 - 18:00'},
    ];

    // Получение текущего шага для Stepper-компонента
    const activeStep = getStatusStep(cleanup.status);

    // Преобразование строковых дат в объекты Date для форматирования
    const beginDate = new Date(cleanup.begin_date);
    const endDate = new Date(cleanup.end_date);

    /**
     * Обработчик клика по требованию участия.
     * Сохраняет выбранное требование и открывает диалог с подробной информацией.
     *
     * @param {string} requirement - Текст выбранного требования.
     */
    const handleRequirementClick = (requirement: string) => {
        setSelectedRequirement(requirement);
        setOpenReqDialog(true);
    };

    // State for managing ViewCleandayResultsDialog
    const [resultsDialogOpen, setResultsDialogOpen] = React.useState(false);

    // Handler to open the dialog
    const handleResultsDialogOpen = () => {
        setResultsDialogOpen(true);
    };

    // Handler to close the dialog
    const handleResultsDialogClose = () => {
        setResultsDialogOpen(false);
    };

    // State for CancelCleandayDialog
    const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);

    /**
     * Handler to open the cancel cleanday dialog
     */
    const handleCancelCleandayOpen = () => {
        setCancelDialogOpen(true);
    };

    /**
     * Handler to close the cancel cleanday dialog
     */
    const handleCancelCleandayClose = () => {
        setCancelDialogOpen(false);
    };

    /**
     * Handler for confirming cleanday cancellation
     */
    const handleCancelCleandayConfirm = () => {
        // TODO: Implement actual API call to cancel the cleanday
        setCleanup({
            ...cleanup,
            status: 'Отменен'
        });
        showNotification('Субботник успешно отменен', 'success');
    };

    // State for CleandayHistoryDialog
    const [historyDialogOpen, setHistoryDialogOpen] = React.useState(false);
    
    // Mock data for history entries
    const [historyEntries] = React.useState<CleanDayHistoryEntry[]>([
        {
            id: 1,
            firstName: 'Иван',
            lastName: 'Иванов',
            date: '2025-03-10 14:32',
            action: 'Создание',
            details: 'Создан субботник "Уборка сквера"'
        },
        {
            id: 2,
            firstName: 'Петров',
            lastName: 'Петр',
            date: '2025-03-10 15:45',
            action: 'Присоединение',
            details: 'Пользователь присоединился к субботнику'
        },
        {
            id: 3,
            firstName: 'Сидоров',
            lastName: 'Сидор',
            date: '2025-03-11 09:15',
            action: 'Присоединение',
            details: 'Пользователь присоединился к субботнику'
        },
        {
            id: 4,
            firstName: 'Иван',
            lastName: 'Иванов',
            date: '2025-03-11 10:30',
            action: 'Редактирование',
            details: 'Изменено описание субботника: добавлена информация о необходимом инвентаре'
        },
        {
            id: 5,
            firstName: 'Сидоров',
            lastName: 'Сидор',
            date: '2025-03-11 12:20',
            action: 'Отмена участия',
            details: 'Пользователь отменил участие в субботнике'
        },
        {
            id: 6,
            firstName: 'Смирнова',
            lastName: 'Анна',
            date: '2025-03-11 14:05',
            action: 'Присоединение',
            details: 'Пользователь присоединился к субботнику'
        },
        {
            id: 7,
            firstName: 'Иван',
            lastName: 'Иванов',
            date: '2025-03-11 16:40',
            action: 'Загрузка фото',
            details: 'Добавлены 3 новые фотографии локации'
        },
        {
            id: 8,
            firstName: 'Козлов',
            lastName: 'Дмитрий',
            date: '2025-03-12 08:30',
            action: 'Присоединение',
            details: 'Пользователь присоединился к субботнику'
        },
        {
            id: 9,
            firstName: 'Иван',
            lastName: 'Иванов',
            date: '2025-03-12 09:00',
            action: 'Комментарий',
            details: 'Добавлен комментарий: "Напоминаю всем, что встречаемся у центрального входа в сквер"'
        }
    ]);
    
    /**
     * Handler to open the history dialog
     */
    const handleHistoryDialogOpen = () => {
        setHistoryDialogOpen(true);
    };
    
    /**
     * Handler to close the history dialog
     */
    const handleHistoryDialogClose = () => {
        setHistoryDialogOpen(false);
    };
    
    // State for CleandayParticipantsDialog
    const [participantsDialogOpen, setParticipantsDialogOpen] = React.useState(false);
    
    // Mock data for cleanday participants
    const [cleandayParticipants] = React.useState<CleandayParticipant[]>([
        {
            id: 1,
            firstName: 'Иван',
            lastName: 'Иванов',
            login: 'ivanov',
            status: ParticipationStatus.GOING
        },
        {
            id: 2,
            firstName: 'Петрова',
            lastName: 'Мария',
            login: 'petrova',
            status: ParticipationStatus.GOING
        },
        {
            id: 3,
            firstName: 'Сидоров',
            lastName: 'Алексей',
            login: 'sidorov',
            status: ParticipationStatus.LATE
        },
        {
            id: 4,
            firstName: 'Смирнова',
            lastName: 'Елена',
            login: 'smirnova',
            status: ParticipationStatus.MAYBE
        },
        {
            id: 5,
            firstName: 'Козлов',
            lastName: 'Дмитрий',
            login: 'kozlov',
            status: ParticipationStatus.GOING
        },
        {
            id: 6,
            firstName: 'Новикова',
            lastName: 'Ольга',
            login: 'novikova',
            status: ParticipationStatus.MAYBE
        },
        {
            id: 7,
            firstName: 'Морозов',
            lastName: 'Павел',
            login: 'morozov',
            status: ParticipationStatus.GOING
        },
        {
            id: 8,
            firstName: 'Волкова',
            lastName: 'Анна',
            login: 'volkova',
            status: ParticipationStatus.LATE
        },
        {
            id: 9,
            firstName: 'Лебедев',
            lastName: 'Сергей',
            login: 'lebedev',
            status: ParticipationStatus.GOING
        },
        {
            id: 10,
            firstName: 'Кузнецова',
            lastName: 'Наталья',
            login: 'kuznetsova',
            status: ParticipationStatus.MAYBE
        },
        {
            id: 11,
            firstName: 'Соколов',
            lastName: 'Игорь',
            login: 'sokolov',
            status: ParticipationStatus.GOING
        },
        {
            id: 12,
            firstName: 'Попова',
            lastName: 'Екатерина',
            login: 'popova',
            status: ParticipationStatus.GOING
        },
        {
            id: 13,
            firstName: 'Лебедева',
            lastName: 'Татьяна',
            login: 'lebedeva',
            status: ParticipationStatus.MAYBE
        },
        {
            id: 14,
            firstName: 'Кузнецов',
            lastName: 'Андрей',
            login: 'kuznetsov',
            status: ParticipationStatus.GOING
        },
        {
            id: 15,
            firstName: 'Соколова',
            lastName: 'Юлия',
            login: 'sokolova',
            status: ParticipationStatus.GOING
        }
    ]);
    
    /**
     * Handler to open the participants dialog
     */
    const handleParticipantsDialogOpen = () => {
        setParticipantsDialogOpen(true);
    };
    
    /**
     * Handler to close the participants dialog
     */
    const handleParticipantsDialogClose = () => {
        setParticipantsDialogOpen(false);
    };
    
    return (
        <Box className={"cleanday-box"}>
            <Box sx={{margin: '10px 0px 0px 20px'}}>
                {/* Заголовок страницы */}
                <Typography variant="h4" gutterBottom>
                    Информация о субботнике
                </Typography>

                {/* Основная сетка страницы */}
                <Grid container spacing={3}>
                    {/* Левая панель с информацией о субботнике */}
                    <Grid item xs={12} md={6}>
                        {/* Отображение статуса субботника с помощью Stepper */}
                        <Box sx={{width: '100%', mb: 2}}>
                            <Stepper activeStep={activeStep} alternativeLabel>
                                {statusSteps.map((step, index) => (
                                    <Step key={step.label}>
                                        <StepLabel>
                                            {step.label}
                                            <Typography variant="caption" display="block">
                                                {index === 0 && step.date}
                                                {index === 1 && step.date}
                                                {index === 2 && step.date}
                                            </Typography>
                                        </StepLabel>
                                    </Step>
                                ))}
                            </Stepper>

                            {/* Название субботника */}
                            <TextField
                                fullWidth
                                label="Название субботника"
                                value={cleanup.name}
                                InputProps={{readOnly: true}}
                                size="small"
                                margin={'normal'}
                            />
                        </Box>

                        {/* Галерея изображений субботника с навигацией */}
                        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                            {cleanupPics.Images.length > 0 && (
                                <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                    <IconButton onClick={handlePrevPhoto}>
                                        <ArrowLeft/>
                                    </IconButton>
                                    <img
                                        src={cleanupPics.Images[currentPhotoIndex].photo}
                                        alt={cleanupPics.Images[currentPhotoIndex].description}
                                        style={{
                                            maxWidth: '200px',
                                            height: '200px',
                                            margin: '0 16px',
                                            objectFit: 'cover'
                                        }}
                                    />
                                    <IconButton onClick={handleNextPhoto}>
                                        <ArrowRight/>
                                    </IconButton>
                                </Box>
                            )}
                        </Box>

                        {/* Блок с подробной информацией о субботнике */}
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                Общая информация
                            </Typography>

                            <Grid container spacing={2}>
                                {/* Информация о локации */}
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Название локации"
                                        value={cleanup.location.address}
                                        InputProps={{readOnly: true}}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Город"
                                        value={cleanup.location.city}
                                        InputProps={{readOnly: true}}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Адрес"
                                        value={cleanup.location.address}
                                        InputProps={{readOnly: true}}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Описание локации"
                                        value={cleanup.location.instructions || '-'}
                                        InputProps={{readOnly: true}}
                                        multiline
                                        rows={2}
                                        size="small"
                                    />
                                </Grid>

                                {/* Информация о времени проведения */}
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Дата начала"
                                        value={beginDate.toLocaleDateString()}
                                        InputProps={{readOnly: true}}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Время начала"
                                        value="10:00"
                                        InputProps={{readOnly: true}}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Дата конца"
                                        value={endDate.toLocaleDateString()}
                                        InputProps={{readOnly: true}}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Время конца"
                                        value="12:00"
                                        InputProps={{readOnly: true}}
                                        size="small"
                                    />
                                </Grid>

                                {/* Информация об организаторе */}
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Организатор"
                                        value={cleanup.organizer}
                                        InputProps={{readOnly: true}}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Организация"
                                        value={cleanup.organization || '-'}
                                        InputProps={{readOnly: true}}
                                        size="small"
                                    />
                                </Grid>

                                {/* Информация о площади уборки */}
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Площадь, м²"
                                        value={cleanup.area}
                                        InputProps={{readOnly: true}}
                                        size="small"
                                    />
                                </Grid>

                                {/* Описание субботника */}
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Описание"
                                        value={cleanup.description}
                                        InputProps={{readOnly: true}}
                                        size="small"
                                        multiline
                                        rows={4}
                                    />
                                </Grid>

                                {/* Отображение тегов субботника */}
                                <Grid item xs={12}>
                                    <Typography>Теги:</Typography>
                                    {cleanup.tags.map((tag) => (
                                        <Chip key={tag} label={tag} sx={{mr: 1, mb: 1}}/>
                                    ))}
                                </Grid>

                                {/* Информация о количестве участников */}
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Рекомендуемое число участников"
                                        value={cleanup.recommended_count}
                                        InputProps={{readOnly: true}}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Зарегистрировано участников (нажмите для списка)"
                                        value={cleanup.participant_count}
                                        InputProps={{readOnly: true}}
                                        size="small"
                                        onClick={handleClick}
                                    />
                                </Grid>

                                {/* Кнопка для просмотра итогов субботника */}
                                <Grid item xs={12}>
                                    <Button variant="contained" color="success"
                                            sx={{
                                                backgroundColor: '#3C6C5F',
                                                color: 'white',
                                                '&:hover': {
                                                    backgroundColor: '#345e51',
                                                },
                                                height: '45px',
                                                width: '100%',
                                            }}
                                            onClick={handleResultsDialogOpen}
                                    >
                                        итоги субботника
                                    </Button>

                                    {/* Информация о статусе участников */}
                                    <Typography marginTop={'10px'} variant="body1" gutterBottom onClick={handleClick}>
                                        Точно пойдут: {15} участников (нажмите для просмотра)
                                    </Typography>
                                    <Typography marginTop={'10px'} variant="body1" gutterBottom onClick={handleClick}>
                                        Опоздают: {5} участников (нажмите для просмотра)
                                    </Typography>
                                    <Typography marginTop={'10px'} variant="body1" gutterBottom onClick={handleClick}>
                                        Возможно, пойдут: {30} участников (нажмите для просмотра)
                                    </Typography>

                                    {/* Раздел с условиями участия */}
                                    <Typography variant={'h5'} sx={{mb: '10px', mt: '10px'}}>Соответствие условиям
                                        участия:</Typography>
                                    {cleanup.requirements && (
                                        <List sx={{width: '100%'}}>
                                            {cleanup.requirements.map((req, idx) => (
                                                <ListItem key={idx} disablePadding sx={{border: 'medium'}}>
                                                    <ListItemButton onClick={handleParticipantsDialogOpen}>
                                                        <TextField
                                                            fullWidth
                                                            label={"Условие " + (idx + 1) + " (нажмите для списка участников)"}
                                                            value={req}
                                                            InputProps={{readOnly: true}}
                                                        />
                                                    </ListItemButton>
                                                </ListItem>
                                            ))}
                                        </List>
                                    )}
                                </Grid>

                                {/* Отображение метаданных субботника */}
                                <Grid item xs={12}>
                                    <Box>
                                        <Typography variant="body2" sx={{mb: 0.5}}>
                                            Дата создания - {cleanup.created_at}
                                        </Typography>
                                        <Typography variant="body2" sx={{mb: 2}}>
                                            Дата последнего изменения - {cleanup.updated_at}
                                        </Typography>
                                        <Typography variant="body2" sx={{mb: 2}}>
                                            ID: {cleanup.key}
                                        </Typography>
                                    </Box>
                                </Grid>

                                {/* Кнопки действий для управления субботником */}
                                <Grid item xs={12}>
                                    <Button variant="contained" color="success"
                                            sx={{
                                                height: '45px',
                                                width: '100%',
                                            }}
                                    onClick={handleParticipationDialogOpen}>
                                        изменить участие в субботнике
                                    </Button>
                                </Grid>
                                <Grid item xs={6}>
                                    <Button variant="contained" color="warning"
                                            sx={{
                                                height: '45px',
                                                width: '100%',
                                            }}
                                            onClick={handleEditOpen}
                                    >
                                        редактировать
                                    </Button>
                                </Grid>
                                <Grid item xs={6}>
                                    <Button variant="contained" color="info"
                                            sx={{
                                                height: '45px',
                                                width: '100%',
                                            }}
                                            onClick={handleCancelCleandayOpen}>
                                        отменить субботник
                                    </Button>
                                </Grid>
                                <Grid item xs={12}>
                                    <Button variant="contained" color="secondary"
                                            sx={{
                                                height: '45px',
                                                width: '100%',
                                            }}
                                            onClick={handleOpenCompletionDialog}
                                    >
                                        завершить субботник (+10 опыта)
                                    </Button>
                                </Grid>
                                <Grid item xs={12}>
                                    <Button
                                        variant="contained"
                                        sx={{
                                            backgroundColor: '#3C6C5F',
                                            color: 'white',
                                            '&:hover': {
                                                backgroundColor: '#345e51',
                                            },
                                            height: '45px',
                                            width: '100%',
                                        }}
                                        onClick={handleHistoryDialogOpen}
                                    >
                                        история активности субботника
                                    </Button>
                                </Grid>

                                {/* Кнопка возврата к списку субботников */}
                                <Grid item xs={12}>
                                    <Button
                                        variant="contained"
                                        sx={{
                                            backgroundColor: '#3C6C5F',
                                            color: 'white',
                                            '&:hover': {
                                                backgroundColor: '#345e51',
                                            },
                                            height: '45px',
                                            width: '100%',
                                        }}
                                        component={Link}
                                        to="/cleandays"
                                    >
                                        <ArrowBackIcon/>назад
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>

                    {/* Правая панель - комментарии к субботнику */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{
                            border: '1px solid #ccc',
                            borderRadius: 1,
                            p: 2,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                            <Typography variant="h6" gutterBottom>
                                Комментарии
                            </Typography>

                            {/* Форма для добавления нового комментария */}
                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                                <TextField
                                    fullWidth
                                    label="Новое сообщение"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    size="small"
                                    sx={{mr: 1}}
                                />
                                <IconButton onClick={handleAddComment} color="primary">
                                    <SendIcon/>
                                </IconButton>
                            </Box>

                            {/* Список существующих комментариев */}
                            <Box sx={{flexGrow: 1, overflowY: 'auto', mb: 2}}>
                                <List>
                                    {comments.comments?.map((comment) => (
                                        <ListItem key={comment.key} alignItems="flex-start" sx={{py: 1}}>
                                            <ListItemText
                                                primary={
                                                    <Typography sx={{fontWeight: 'bold'}}>
                                                        {comment.author} - {new Date(comment.date).toLocaleTimeString()}
                                                    </Typography>
                                                }
                                                secondary={<Typography>{comment.text}</Typography>}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {/* Диалог редактирования субботника */}
            <EditCleandayDialog
                open={editOpen}
                onClose={handleEditClose}
                onSubmit={handleEditSave}
                locations={mockLocations}
                cleanday={cleanup}
            />
            {/* ParticipationDialog */}
            <ParticipationDialog
                open={participationDialogOpen}
                onClose={handleParticipationDialogClose}
                onSubmit={handleParticipationSubmit}
                requirements={participationRequirements}
                initialStatus={participationStatus}
                initialRequirements={participationSelectedRequirements}
                cleandayName={cleanup.name}
            />

            {/* CleandayCompletionDialog */}
            <CleandayCompletionDialog
                open={completionDialogOpen}
                onClose={handleCloseCompletionDialog}
                onSubmit={handleSubmitCompletionData}
                cleandayName={cleanup.name}
                participants={participants}
            />

            {/* ViewCleandayResultsDialog Component */}
            <ViewCleandayResultsDialog
                open={resultsDialogOpen}
                onClose={handleResultsDialogClose}
                results={mockCleandayResults}
            />

            {/* CancelCleandayDialog */}
            <CancelCleandayDialog
                open={cancelDialogOpen}
                onClose={handleCancelCleandayClose}
                onConfirm={handleCancelCleandayConfirm}
                // title="Отмена субботника"
                // message={`Вы уверены, что хотите отменить субботник "${cleanup.name}"? Это действие нельзя будет отменить.`}
            />

            {/* CleandayHistoryDialog */}
            <CleandayHistoryDialog
                open={historyDialogOpen}
                onClose={handleHistoryDialogClose}
                cleandayName={cleanup.name}
                historyEntries={historyEntries}
            />

            {/* CleandayParticipantsDialog */}
            <CleandayParticipantsDialog
                open={participantsDialogOpen}
                onClose={handleParticipantsDialogClose}
                cleandayName={cleanup.name}
                participants={cleandayParticipants}
            />

            {/* Компонент для отображения уведомлений */}
            <Notification message={notificationMessage} severity={notificationSeverity}
                          onClose={handleNotificationClose}/>
        </Box>
    );
};

export default CleandayPage;