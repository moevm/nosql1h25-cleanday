import React from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Avatar,
    LinearProgress,
    CircularProgress,
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import './UserProfilePage.css';
import {Sex} from "@models/User.ts";
import Notification from '@components/Notification.tsx';
import {useNavigate} from "react-router-dom";
import EditUserProfileDialog from "@components/dialog/EditUserProfileDialog.tsx";
import OrganizedCleandaysDialog from '@components/dialog/OrganizedCleandaysDialog';
import ParticipatedCleandaysDialog from '@components/dialog/ParticipatedCleandaysDialog';
import {getStatusByLevel} from "@utils/user/getStatusByLevel.ts";
import {UserProfileEdit} from "@models/deleteMeLater.ts";
import {useGetMe} from "@hooks/authorization/useGetMe.tsx";
import {useGetUserParticipatedCleandays} from "@hooks/user/useGetUserParticipatedCleandays.tsx";
import {useGetUserOrganizedCleandays} from "@hooks/user/useGetUserOrganizedCleandays.tsx";

/**
 * Стили для аватара пользователя.
 * Определяет размер, отступ и форму изображения профиля.
 */
const avatarStyle = {
    width: '230px',
    height: '300px',
    marginRight: '16px',
    borderRadius: '0',
};

/**
 * Список доступных городов для выбора в форме редактирования профиля.
 * В реальном приложении этот список должен быть загружен с сервера.
 */
const cities = ["Rome", "Moscow", "Санкт-Петербург", "Новосибирск"];

/**
 * UserProfilePage: Компонент страницы профиля текущего пользователя.
 * Отображает личную информацию, статистику и предоставляет функциональность
 * для редактирования профиля и участия в субботниках.
 *
 * @returns {JSX.Element} - Возвращает JSX-элемент, представляющий страницу профиля пользователя.
 */
const UserProfilePage: React.FC = (): React.JSX.Element => {
    // Получаем данные текущего пользователя
    const {data: currentUser, isLoading: isLoadingCurrentUser, error: currentUserError} = useGetMe();

    // Хук для программной навигации между страницами
    const navigate = useNavigate();

    // Загрузка данных субботников пользователя только после того, как получены данные пользователя
    const userId = currentUser?.id || '';
    const {data: participatedCleandays, isLoading: isLoadingParticipated} = useGetUserParticipatedCleandays(userId);
    const {data: organizedCleandays, isLoading: isLoadingOrganized} = useGetUserOrganizedCleandays(userId);

    // Состояния для отображения уведомлений
    const [notificationMessage, setNotificationMessage] = React.useState<string | null>(null);
    const [notificationSeverity, setNotificationSeverity] = React.useState<'success' | 'info' | 'warning' | 'error'>('success');

    // Состояние для управления видимостью диалога редактирования профиля
    const [editDialogOpen, setEditDialogOpen] = React.useState(false);

    // Состояние для отображения диалога организованных субботников
    const [organizedDialogOpen, setOrganizedDialogOpen] = React.useState<boolean>(false);

    // Состояние для отображения диалога посещённых субботников
    const [participatedDialogOpen, setParticipatedDialogOpen] = React.useState<boolean>(false);

    /**
     * Обработчик нажатия на кнопку редактирования профиля.
     * Открывает диалоговое окно для редактирования данных профиля.
     */
    const handleEditProfile = () => {
        setEditDialogOpen(true);
    };

    /**
     * Обработчик закрытия диалога редактирования профиля.
     * Закрывает диалоговое окно без сохранения изменений.
     */
    const handleEditDialogClose = () => {
        setEditDialogOpen(false);
    };

    /**
     * Обработчик отправки формы редактирования профиля.
     * Обновляет профиль пользователя, закрывает диалоговое окно и показывает уведомление об успехе.
     *
     * @param {UserProfileEdit} data - Обновленные данные профиля пользователя.
     */
    const handleEditDialogSubmit = (data: UserProfileEdit) => {
        // В реальном приложении здесь должен быть запрос к API для обновления профиля
        setNotificationMessage('Профиль успешно обновлён!');
        setNotificationSeverity('success');
        setEditDialogOpen(false);
    };

    /**
     * Обработчик закрытия уведомления.
     * Очищает сообщение уведомления, что приводит к его скрытию.
     */
    const handleNotificationClose = React.useCallback(() => {
        setNotificationMessage(null);
    }, [setNotificationMessage]);

    /**
     * Обработчик нажатия кнопки "Назад".
     * Осуществляет переход на страницу списка пользователей.
     */
    const handleGoBack = () => {
        navigate('/users');
    };

    /**
     * Обработчик нажатия на кнопку "ОРГАНИЗОВАНО".
     * Открывает диалог со списком организованных субботников.
     */
    const handleOrganizedClick = () => {
        setOrganizedDialogOpen(true);
    };

    /**
     * Обработчик нажатия на кнопку "УЧАСТИЕ".
     * Открывает диалог со списком посещённых субботников.
     */
    const handleParticipatedClick = () => {
        setParticipatedDialogOpen(true);
    };

    // Проверка загрузки данных
    const isLoading = isLoadingCurrentUser || isLoadingParticipated || isLoadingOrganized;

    // Отображение состояния загрузки
    if (isLoading) {
        return (
            <Box className="user-profile-box"
                 sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh'}}>
                <CircularProgress/>
            </Box>
        );
    }

    // Отображение состояния ошибки
    if (currentUserError) {
        return (
            <Box className="user-profile-box" sx={{padding: 3}}>
                <Typography color="error" variant="h5">Error loading user data</Typography>
                <Typography>{currentUserError.message}</Typography>
                <Button onClick={handleGoBack} variant="contained" startIcon={<ArrowBackIcon/>} sx={{mt: 2}}>
                    Обратно к списку пользователей
                </Button>
            </Box>
        );
    }

    // Отображение состояния, когда пользователь не найден
    if (!currentUser) {
        return (
            <Box className="user-profile-box" sx={{padding: 3}}>
                <Typography variant="h5">Профиль не найден</Typography>
                <Button onClick={handleGoBack} variant="contained" startIcon={<ArrowBackIcon/>} sx={{mt: 2}}>
                    Обратно к списку пользователей
                </Button>
            </Box>
        );
    }

    // Вычисляемый статус уровня пользователя
    const levelStatus = getStatusByLevel(currentUser.level);

    // Далее используем currentUser вместо userData
    return (
        <Box className={"user-profile-box"}>
            <Box display='flex' flexDirection='column' alignItems='flex-start'>
                {/* Контейнер с основной информацией о пользователе */}
                <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    width: '700px'
                }}>
                    {/* Имя и фамилия пользователя */}
                    <Typography variant="h3" gutterBottom>
                        {currentUser.firstName} {currentUser.lastName}
                    </Typography>

                    {/* Блок с аватаром и полями профиля */}
                    <Box sx={{display: 'flex', alignItems: 'start', marginBottom: 3, width: '100%', maxWidth: 800,}}>
                        {/* Аватар пользователя */}
                        <Avatar style={avatarStyle}/>

                        {/* Поля с информацией о пользователе */}
                        <Box sx={{display: 'flex', flexDirection: 'column', width: '100%', maxWidth: "100%"}}>
                            <TextField label="Логин" value={currentUser.login} size="small" fullWidth={true}
                                       margin="dense"
                                       InputProps={{readOnly: true}}/>
                            <TextField label="Пол" value={currentUser.sex} size="small" margin="dense"
                                       InputProps={{readOnly: true}}/>
                            <TextField label="Город" value={currentUser.city} size="small" margin="dense"
                                       InputProps={{readOnly: true}}/>
                            <TextField
                                label="О себе"
                                value={currentUser.aboutMe || ''}
                                multiline
                                rows={5}
                                size="small"
                                margin="dense"
                                InputProps={{readOnly: true}}
                            />
                        </Box>
                    </Box>
                </Box>

                {/* Остальная часть компонента, также заменяющая userData на currentUser */}
                <Box className={"user-profile-box-2"}>
                    <Typography variant="h5" sx={{mt: 2}}>
                        Уровень - {levelStatus}
                    </Typography>

                    <Box sx={{display: 'flex', alignItems: 'center', width: '100%', maxWidth: 300, mt: 1}}>
                        <LinearProgress variant="determinate" color={"success"} value={currentUser.score % 50 * 2}
                                        sx={{flexGrow: 1, mr: 1}}/>
                        <Typography>{currentUser.score % 50} / 50</Typography>
                    </Box>

                    <Typography variant="h5" sx={{mt: 3, mb: 1}}>
                        Статистика:
                    </Typography>

                    <Box sx={{display: 'flex', gap: 1, mb: 2}}>
                        <Button
                            variant="contained"
                            color="success"
                            onClick={handleOrganizedClick}
                            sx={{
                                backgroundColor: '#3C6C5F',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: '#345e51',
                                },
                                height: '45px',
                                width: '190px',
                            }}>
                            ОРГАНИЗОВАНО: {currentUser.organizedCount}
                        </Button>
                        <Button
                            variant="contained"
                            color="success"
                            onClick={handleParticipatedClick}
                            sx={{
                                backgroundColor: '#3C6C5F',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: '#345e51',
                                },
                                height: '45px',
                                width: '190px',
                            }}>
                            УЧАСТИЕ: {currentUser.participantsCount}
                        </Button>
                    </Box>

                    <Box sx={{display: 'flex', alignItems: 'center', width: '100%'}}>
                        <Box>
                            <Typography variant="body2" sx={{mb: 0.5}}>
                                Убрано территории - {currentUser.cleaned} м²
                            </Typography>
                            <Typography variant="body2" sx={{mb: 0.5}}>
                                Дата создания
                                - {currentUser.createdAt ? currentUser.createdAt.toLocaleString() : "Неизвестно"}
                            </Typography>
                            <Typography variant="body2" sx={{mb: 2}}>
                                Дата последнего изменения -
                                {currentUser.updatedAt ? currentUser.updatedAt.toLocaleString() : "Неизвестно"}
                            </Typography>
                            <Typography variant="body2" sx={{mb: 2}}>
                                ID: {currentUser.id}
                            </Typography>
                        </Box>

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleEditProfile}
                            startIcon={<EditIcon/>}
                            sx={{
                                backgroundColor: '#f16837',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: '#d15429',
                                },
                                ml: "7vw"
                            }}
                        >
                            Редактировать профиль
                        </Button>
                    </Box>

                    <Button onClick={handleGoBack}
                            variant="contained"
                            startIcon={<ArrowBackIcon/>}
                            sx={{
                                backgroundColor: '#3C6C5F',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: '#345e51',
                                },
                                height: '45px',
                                width: '100%',
                                mb: 2
                            }}>
                        Назад к списку пользователей
                    </Button>
                </Box>
            </Box>

            {notificationMessage && (
                <Notification
                    message={notificationMessage}
                    severity={notificationSeverity}
                    onClose={handleNotificationClose}
                />
            )}

            <EditUserProfileDialog
                open={editDialogOpen}
                onClose={handleEditDialogClose}
                onSubmit={handleEditDialogSubmit}
                profile={{
                    key: currentUser.id,
                    login: currentUser.login,
                    first_name: currentUser.firstName,
                    last_name: currentUser.lastName,
                    sex: currentUser.sex as Sex,
                    city: currentUser.city,
                    about_me: currentUser.aboutMe || '',
                    score: currentUser.score,
                    level: currentUser.level,
                    cleanday_count: currentUser.participantsCount,
                    organized_count: currentUser.organizedCount,
                    stat: currentUser.cleaned,
                    created_at: currentUser.createdAt?.toISOString() || '',
                    updated_at: currentUser.updatedAt?.toISOString() || '',
                }}
                cities={cities}
            />

            <OrganizedCleandaysDialog
                open={organizedDialogOpen}
                onClose={() => setOrganizedDialogOpen(false)}
                userName={`${currentUser.firstName} ${currentUser.lastName}`}
                cleandays={organizedCleandays?.contents || []}
            />

            <ParticipatedCleandaysDialog
                open={participatedDialogOpen}
                onClose={() => setParticipatedDialogOpen(false)}
                userName={`${currentUser.firstName} ${currentUser.lastName}`}
                cleandays={participatedCleandays?.contents || []}
            />
        </Box>
    );
};

export default UserProfilePage;