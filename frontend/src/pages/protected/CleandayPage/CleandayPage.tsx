import './CleandayPage.css';

import React, {useState} from 'react';
import {Link, useParams} from "react-router-dom";
import {useGetCleandayById} from '@hooks/cleanday/useGetCleandayById.tsx';
import {useGetCleandayComments} from '@hooks/cleanday/useGetCleandayComments.tsx';
import {useCreateComment} from '@hooks/cleanday/useCreateComment.tsx';
import {
    Box,
    Button,
    Chip,
    CircularProgress,
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
    Alert,
    Divider,
    Avatar,
} from '@mui/material';

import SendIcon from '@mui/icons-material/Send';
import ArrowLeft from '@mui/icons-material/ArrowLeft';
import ArrowRight from '@mui/icons-material/ArrowRight';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import Notification from '@components/Notification.tsx';
import {CleandayStatus} from '@models/Cleanday.ts';
import {Comment} from '@models/Comment.ts';

import EditCleandayDialog from '@components/dialog/EditCleandayDialog.tsx';
import ParticipationDialog from "@components/dialog/ParticipationDialog.tsx";
import CleandayCompletionDialog from "@components/dialog/CleandayCompletionDialog.tsx";
import ViewCleandayResultsDialog from '@components/dialog/ViewCleandayResultsDialog.tsx';
import CancelCleandayDialog from '@/components/dialog/CancelCleandayDialog';
import CleandayHistoryDialog, {CleanDayHistoryEntry} from '@/components/dialog/CleandayHistoryDialog';
import CleandayParticipantsDialog, {CleandayParticipant} from '@/components/dialog/CleandayParticipantsDialog';

// Temporary mock data until all API endpoints are implemented
import {
    Requirement,
    ParticipationStatus,
    Participant,
    ParticipantStatus,
    CompletionData,
    CleandayResults
} from "@models/deleteMeLater.ts";

/**
 * CleandayPage: Компонент для отображения подробной информации о субботнике.
 *
 * @returns {JSX.Element} - Возвращает JSX-элемент, представляющий страницу субботника.
 */
const CleandayPage: React.FC = (): React.JSX.Element => {
    const {id = ''} = useParams<{ id: string }>();
    const {data: cleanday, isLoading, error} = useGetCleandayById(id);

    // Параметры для загрузки комментариев - увеличим размер до 100
    const commentsParams = {
        page: 0,
        size: 100,
        sort: 'date,desc' // Сортировка комментариев по дате (новые сверху)
    };

    // Запрос комментариев с сервера
    const {
        data: commentsData,
        isLoading: isCommentsLoading,
        error: commentsError,
        refetch: refetchComments
    } = useGetCleandayComments(id, commentsParams);

    // Инициализация хука для создания комментариев
    const createCommentMutation = useCreateComment(id);

    // State для комментариев и формы нового комментария
    const [newComment, setNewComment] = useState('');

    // State для уведомлений
    const [notificationMessage, setNotificationMessage] = useState<string>('');
    const [notificationSeverity, setNotificationSeverity] = useState<'success' | 'info' | 'warning' | 'error'>('success');

    // State для галереи изображений
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [cleanupPics, setCleanupPics] = useState<{ Images: any[] }>({Images: []});

    // State для диалогов
    const [editOpen, setEditOpen] = useState(false);
    const [participationDialogOpen, setParticipationDialogOpen] = useState(false);
    const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
    const [resultsDialogOpen, setResultsDialogOpen] = useState(false);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
    const [participantsDialogOpen, setParticipantsDialogOpen] = useState(false);

    // Временные тестовые данные для результатов
    const mockCleandayResults: CleandayResults = {
        id: 1,
        name: cleanday?.name || 'Уборка',
        date: cleanday?.beginDate?.toLocaleDateString() || '',
        location: cleanday?.location?.address || '',
        results: cleanday?.results || ['Собрано 10 мешков мусора'],
        photos: ['/img_1.png', '/img_2.png', '/img_3.png'],
        participantsCount: cleanday?.participantsCount || 0,
    };

    // Данные для требований к участию
    const [participationRequirements] = useState<Requirement[]>([
        {id: 1, name: 'Перчатки'},
        {id: 2, name: 'Хорошее настроение'},
    ]);

    // Состояние участия
    const [participationStatus, setParticipationStatus] = useState<ParticipationStatus>(ParticipationStatus.GOING);
    const [participationSelectedRequirements, setParticipationSelectedRequirements] = useState<number[]>([1]);

    // Участники для диалога завершения
    const participants: Participant[] = [
        {id: 1, firstName: 'Иван', lastName: 'Иванов', username: 'ivanov', status: ParticipantStatus.UNKNOWN},
        {id: 2, firstName: 'Мария', lastName: 'Смирнова', username: 'smirnova', status: ParticipantStatus.UNKNOWN},
    ];

    // Данные для записей истории
    const [historyEntries] = useState<CleanDayHistoryEntry[]>([
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
            firstName: 'Петр',
            lastName: 'Петров',
            date: '2025-03-10 15:45',
            action: 'Присоединение',
            details: 'Пользователь присоединился к субботнику'
        },
    ]);

    // Данные об участниках субботника
    const [cleandayParticipants] = useState<CleandayParticipant[]>([
        {
            id: 1,
            firstName: 'Иван',
            lastName: 'Иванов',
            login: 'ivanov',
            status: ParticipationStatus.GOING
        },
        {
            id: 2,
            firstName: 'Мария',
            lastName: 'Петрова',
            login: 'petrova',
            status: ParticipationStatus.GOING
        },
    ]);

    /**
     * Функция для отображения уведомления.
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

    /**
     * Обработчики для диалога редактирования.
     */
    const handleEditOpen = () => setEditOpen(true);
    const handleEditClose = () => setEditOpen(false);

    /**
     * Обработчик сохранения изменений субботника.
     */
    const handleEditSave = (updatedCleanday: any) => {
        // Будет заменено на реальный API-запрос
        setEditOpen(false);
        showNotification('Изменения сохранены', 'success');
    };

    /**
     * Обработчики для диалога участия.
     */
    const handleParticipationDialogOpen = () => {
        setParticipationDialogOpen(true);
    };

    const handleParticipationDialogClose = () => {
        setParticipationDialogOpen(false);
    };

    /**
     * Обработчик отправки данных об участии.
     */
    const handleParticipationSubmit = (data: { status: ParticipationStatus; selectedRequirements: number[] }) => {
        setParticipationStatus(data.status);
        setParticipationSelectedRequirements(data.selectedRequirements);
        showNotification('Участие успешно обновлено', 'success');
        setParticipationDialogOpen(false);
    };

    /**
     * Обработчики для диалога завершения.
     */
    const handleOpenCompletionDialog = () => {
        setCompletionDialogOpen(true);
    };

    const handleCloseCompletionDialog = () => {
        setCompletionDialogOpen(false);
    };

    /**
     * Обработчик отправки данных о завершении.
     */
    const handleSubmitCompletionData = (data: CompletionData) => {
        console.log('Completion Data:', data);
        showNotification('Субботник успешно завершен!', 'success');
        setCompletionDialogOpen(false);
    };

    /**
     * Обработчик добавления нового комментария с использованием хука useCreateComment.
     */
    const handleAddComment = () => {
        if (newComment.trim()) {
            // Вызываем мутацию для отправки комментария на сервер
            createCommentMutation.mutate(newComment.trim(), {
                onSuccess: () => {
                    // Очищаем поле ввода
                    setNewComment('');
                    // Обновляем список комментариев после успешного добавления
                    refetchComments();
                    showNotification('Комментарий успешно добавлен', 'success');
                },
                onError: (error) => {
                    console.error('Ошибка при добавлении комментария:', error);
                    showNotification('Ошибка при добавлении комментария', 'error');
                }
            });
        } else {
            showNotification('Пожалуйста, введите комментарий', 'warning');
        }
    };

    /**
     * Обработка нажатия Enter в поле комментария
     */
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddComment();
        }
    };

    /**
     * Обработчики для навигации по фото.
     */
    const handleNextPhoto = () => {
        if (cleanupPics.Images.length > 0) {
            setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % cleanupPics.Images.length);
        }
    };

    const handlePrevPhoto = () => {
        if (cleanupPics.Images.length > 0) {
            setCurrentPhotoIndex((prevIndex) => (prevIndex - 1 + cleanupPics.Images.length) % cleanupPics.Images.length);
        }
    };

    /**
     * Обработчики для диалога результатов.
     */
    const handleResultsDialogOpen = () => {
        setResultsDialogOpen(true);
    };

    const handleResultsDialogClose = () => {
        setResultsDialogOpen(false);
    };

    /**
     * Обработчики для диалога отмены.
     */
    const handleCancelCleandayOpen = () => {
        setCancelDialogOpen(true);
    };

    const handleCancelCleandayClose = () => {
        setCancelDialogOpen(false);
    };

    /**
     * Обработчик подтверждения отмены субботника.
     */
    const handleCancelCleandayConfirm = () => {
        // Будет заменено на реальный API-запрос
        showNotification('Субботник успешно отменен', 'success');
        setCancelDialogOpen(false);
    };

    /**
     * Обработчики для диалога истории.
     */
    const handleHistoryDialogOpen = () => {
        setHistoryDialogOpen(true);
    };

    const handleHistoryDialogClose = () => {
        setHistoryDialogOpen(false);
    };

    /**
     * Обработчики для диалога участников.
     */
    const handleParticipantsDialogOpen = () => {
        setParticipantsDialogOpen(true);
    };

    const handleParticipantsDialogClose = () => {
        setParticipantsDialogOpen(false);
    };

    /**
     * Функция для определения шага статуса для stepper.
     */
    const getStatusStep = (status: CleandayStatus | string): number => {
        switch (status) {
            case CleandayStatus.planned:
                return 0;
            case CleandayStatus.onGoing:
                return 1;
            case CleandayStatus.completed:
                return 2;
            case CleandayStatus.cancelled:
            case CleandayStatus.rescheduled:
            default:
                return -1;
        }
    };

    /**
     * Шаги статуса для stepper.
     */
    const statusSteps = [
        {label: 'Запланирован', date: cleanday?.createdAt?.toLocaleDateString() || ''},
        {label: 'Проходит', date: cleanday?.beginDate?.toLocaleDateString() || ''},
        {label: 'Завершен', date: cleanday?.endDate?.toLocaleDateString() || ''},
    ];

    // Получаем активный шаг для stepper
    const activeStep = cleanday ? getStatusStep(cleanday.status) : -1;

    // Обработка состояния загрузки
    if (isLoading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh'}}>
                <CircularProgress/>
            </Box>
        );
    }

    // Обработка состояния ошибки
    if (error || !cleanday) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh'}}>
                <Alert severity="error">
                    Произошла ошибка при загрузке данных о субботнике.
                    Пожалуйста, попробуйте позже или вернитесь к списку субботников.
                </Alert>
                <Button
                    variant="contained"
                    component={Link}
                    to="/cleandays"
                    sx={{mt: 2, ml: 2}}
                >
                    К списку субботников
                </Button>
            </Box>
        );
    }

    return (
        <Box className={"cleanday-box"}>
            <Box sx={{margin: '10px 0px 0px 20px'}}>
                {/* Заголовок страницы */}
                <Typography variant="h4" gutterBottom>
                    Информация о субботнике
                </Typography>

                {/* Основная сетка */}
                <Grid container spacing={3}>
                    {/* Левая панель с информацией о субботнике */}
                    <Grid item xs={12} md={6}>
                        {/* Статусный stepper */}
                        <Box sx={{width: '100%', mb: 2}}>
                            <Stepper activeStep={activeStep} alternativeLabel>
                                {statusSteps.map((step, index) => (
                                    <Step key={step.label}>
                                        <StepLabel>
                                            {step.label}
                                            <Typography variant="caption" display="block">
                                                {step.date}
                                            </Typography>
                                        </StepLabel>
                                    </Step>
                                ))}
                            </Stepper>

                            {/* Название субботника */}
                            <TextField
                                fullWidth
                                label="Название субботника"
                                value={cleanday.name}
                                InputProps={{readOnly: true}}
                                size="small"
                                margin={'normal'}
                            />
                        </Box>

                        {/* Галерея изображений */}
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

                        {/* Блок с подробной информацией */}
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
                                        value={cleanday.location.address}
                                        InputProps={{readOnly: true}}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Город"
                                        value={cleanday.city}
                                        InputProps={{readOnly: true}}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Адрес"
                                        value={cleanday.location.address}
                                        InputProps={{readOnly: true}}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Описание локации"
                                        value={cleanday.location.instructions || '-'}
                                        InputProps={{readOnly: true}}
                                        multiline
                                        rows={2}
                                        size="small"
                                    />
                                </Grid>

                                {/* Информация о времени */}
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Дата начала"
                                        value={cleanday.beginDate.toLocaleDateString()}
                                        InputProps={{readOnly: true}}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Время начала"
                                        value={cleanday.beginDate.toLocaleTimeString()}
                                        InputProps={{readOnly: true}}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Дата конца"
                                        value={cleanday.endDate.toLocaleDateString()}
                                        InputProps={{readOnly: true}}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Время конца"
                                        value={cleanday.endDate.toLocaleTimeString()}
                                        InputProps={{readOnly: true}}
                                        size="small"
                                    />
                                </Grid>

                                {/* Информация об организаторе */}
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Организатор"
                                        value={cleanday.organizer}
                                        InputProps={{readOnly: true}}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Организация"
                                        value={cleanday.organization || '-'}
                                        InputProps={{readOnly: true}}
                                        size="small"
                                    />
                                </Grid>

                                {/* Информация о площади */}
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Площадь, м²"
                                        value={cleanday.area}
                                        InputProps={{readOnly: true}}
                                        size="small"
                                    />
                                </Grid>

                                {/* Описание */}
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Описание"
                                        value={cleanday.description}
                                        InputProps={{readOnly: true}}
                                        size="small"
                                        multiline
                                        rows={4}
                                    />
                                </Grid>

                                {/* Теги */}
                                <Grid item xs={12}>
                                    <Typography>Теги:</Typography>
                                    {cleanday.tags.map((tag) => (
                                        <Chip key={tag} label={tag} sx={{mr: 1, mb: 1}}/>
                                    ))}
                                </Grid>

                                {/* Информация об участниках */}
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Рекомендуемое число участников"
                                        value={cleanday.recommendedParticipantsCount}
                                        InputProps={{readOnly: true}}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Зарегистрировано участников"
                                        value={cleanday.participantsCount}
                                        InputProps={{readOnly: true}}
                                        size="small"
                                        onClick={handleParticipantsDialogOpen}
                                    />
                                </Grid>

                                {/* Кнопка просмотра результатов */}
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

                                    {/* Информация о статусах участников */}
                                    <Typography marginTop={'10px'} variant="body1" gutterBottom
                                                sx={{
                                                    cursor: 'pointer',
                                                    color: '#3C6C5FFF',
                                                    textDecoration: 'underline',
                                                    '&:hover': {
                                                        color: 'darkblue',
                                                    },
                                                }}
                                                onClick={handleParticipantsDialogOpen}>
                                        Точно
                                        пойдут: {cleandayParticipants.filter(p => p.status === ParticipationStatus.GOING).length} участников
                                    </Typography>
                                    <Typography marginTop={'10px'} variant="body1" gutterBottom
                                                sx={{
                                                    cursor: 'pointer',
                                                    color: '#3C6C5FFF',
                                                    textDecoration: 'underline',
                                                    '&:hover': {
                                                        color: 'darkblue',
                                                    },
                                                }}
                                                onClick={handleParticipantsDialogOpen}>
                                        Опоздают: {cleandayParticipants.filter(p => p.status === ParticipationStatus.LATE).length} участников
                                    </Typography>
                                    <Typography marginTop={'10px'} variant="body1" gutterBottom
                                                sx={{
                                                    cursor: 'pointer',
                                                    color: '#3C6C5FFF',
                                                    textDecoration: 'underline',
                                                    '&:hover': {
                                                        color: 'darkblue',
                                                    },
                                                }}
                                                onClick={handleParticipantsDialogOpen}>
                                        Возможно,
                                        пойдут: {cleandayParticipants.filter(p => p.status === ParticipationStatus.MAYBE).length} участников
                                    </Typography>

                                    {/* Секция требований участия */}
                                    <Typography variant={'h5'} sx={{mb: '10px', mt: '10px'}}>
                                        Соответствие условиям участия:
                                    </Typography>
                                    {cleanday.requirements && (
                                        <List sx={{width: '100%'}}>
                                            {cleanday.requirements.map((req, idx) => (
                                                <ListItem key={req.id} disablePadding sx={{border: 'medium'}}>
                                                    <ListItemButton onClick={handleParticipantsDialogOpen}>
                                                        <TextField
                                                            fullWidth
                                                            label={"Условие " + (idx + 1)}
                                                            value={req.name}
                                                            InputProps={{readOnly: true}}
                                                        />
                                                    </ListItemButton>
                                                </ListItem>
                                            ))}
                                        </List>
                                    )}
                                </Grid>

                                {/* Метаданные субботника */}
                                <Grid item xs={12}>
                                    <Box>
                                        <Typography variant="body2" sx={{mb: 0.5}}>
                                            Дата создания - {cleanday.createdAt.toLocaleString()}
                                        </Typography>
                                        <Typography variant="body2" sx={{mb: 2}}>
                                            Дата последнего изменения - {cleanday.updatedAt.toLocaleString()}
                                        </Typography>
                                        <Typography variant="body2" sx={{mb: 2}}>
                                            ID: {cleanday.id}
                                        </Typography>
                                    </Box>
                                </Grid>

                                {/* Кнопки действий */}
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

                                {/* Кнопка назад */}
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

                    {/* Правая панель - комментарии */}
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

                            {/* Форма нового комментария */}
                            <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                <TextField
                                    fullWidth
                                    label="Новое сообщение"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    multiline
                                    rows={2}
                                    size="small"
                                    sx={{mr: 1}}
                                    disabled={createCommentMutation.isPending}
                                    placeholder="Введите ваш комментарий здесь..."
                                />
                                <IconButton
                                    onClick={handleAddComment}
                                    color="primary"
                                    disabled={createCommentMutation.isPending}
                                    aria-label="Отправить комментарий"
                                >
                                    {createCommentMutation.isPending ?
                                        <CircularProgress size={24}/> :
                                        <SendIcon />
                                    }
                                </IconButton>
                            </Box>

                            <Divider sx={{mb: 2}}/>

                            {/* Список комментариев с улучшенным отображением */}
                            <Box sx={{flexGrow: 1, overflowY: 'auto', mb: 2}}>
                                {isCommentsLoading ? (
                                    <Box sx={{display: 'flex', justifyContent: 'center', p: 3}}>
                                        <CircularProgress size={24}/>
                                    </Box>
                                ) : commentsError ? (
                                    <Alert severity="error" sx={{mb: 2}}>
                                        Не удалось загрузить комментарии. Пожалуйста, попробуйте позже.
                                    </Alert>
                                ) : commentsData?.contents?.length === 0 ? (
                                    <Box sx={{display: 'flex', justifyContent: 'center', p: 3}}>
                                        <Typography color="text.secondary">
                                            Нет комментариев. Будьте первым, кто оставит комментарий!
                                        </Typography>
                                    </Box>
                                ) : (
                                    <List>
                                        {commentsData?.contents?.map((comment: Comment) => (
                                            <React.Fragment key={comment.id}>
                                                <ListItem alignItems="flex-start" sx={{py: 1}}>
                                                    <Box sx={{ display: 'flex', width: '100%' }}>
                                                        {comment.author && (
                                                            <Avatar
                                                                alt={comment.author.login || 'Аноним'}
                                                                src={comment.author.avatarUrl}
                                                                sx={{ mr: 2, bgcolor: '#3C6C5F' }}
                                                            >
                                                                {(comment.author.login || 'A')[0].toUpperCase()}
                                                            </Avatar>
                                                        )}
                                                        <ListItemText
                                                            primary={
                                                                <Box display="flex" justifyContent="space-between">
                                                                    <Typography sx={{fontWeight: 'bold'}}>
                                                                        {comment.author?.login || 'Аноним'}
                                                                    </Typography>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        {new Date(comment.date).toLocaleString('ru-RU', {
                                                                            day: '2-digit',
                                                                            month: '2-digit',
                                                                            year: 'numeric',
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })}
                                                                    </Typography>
                                                                </Box>
                                                            }
                                                            secondary={
                                                                <Typography
                                                                    component="div"
                                                                    variant="body1"
                                                                    sx={{
                                                                        whiteSpace: 'pre-line',
                                                                        mt: 1,
                                                                        wordBreak: 'break-word'
                                                                    }}
                                                                >
                                                                    {comment.text}
                                                                </Typography>
                                                            }
                                                        />
                                                    </Box>
                                                </ListItem>
                                                <Divider component="li"/>
                                            </React.Fragment>
                                        ))}
                                    </List>
                                )}
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {/* Диалоги */}
            <EditCleandayDialog
                open={editOpen}
                onClose={handleEditClose}
                onSubmit={handleEditSave}
                locations={[]}
                cleanday={cleanday}
            />

            <ParticipationDialog
                open={participationDialogOpen}
                onClose={handleParticipationDialogClose}
                onSubmit={handleParticipationSubmit}
                requirements={participationRequirements}
                initialStatus={participationStatus}
                initialRequirements={participationSelectedRequirements}
                cleandayName={cleanday.name}
            />

            <CleandayCompletionDialog
                open={completionDialogOpen}
                onClose={handleCloseCompletionDialog}
                onSubmit={handleSubmitCompletionData}
                cleandayName={cleanday.name}
                participants={participants}
            />

            <ViewCleandayResultsDialog
                open={resultsDialogOpen}
                onClose={handleResultsDialogClose}
                results={mockCleandayResults}
            />

            <CancelCleandayDialog
                open={cancelDialogOpen}
                onClose={handleCancelCleandayClose}
                onConfirm={handleCancelCleandayConfirm}
            />

            <CleandayHistoryDialog
                open={historyDialogOpen}
                onClose={handleHistoryDialogClose}
                cleandayName={cleanday.name}
                historyEntries={historyEntries}
            />

            <CleandayParticipantsDialog
                open={participantsDialogOpen}
                onClose={handleParticipantsDialogClose}
                cleandayName={cleanday.name}
                participants={cleandayParticipants}
            />

            {/* Компонент уведомлений */}
            <Notification
                message={notificationMessage}
                severity={notificationSeverity}
                onClose={handleNotificationClose}
            />
        </Box>
    );
};

export default CleandayPage;