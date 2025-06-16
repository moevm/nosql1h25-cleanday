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
import {useGetUserParticipatedCleandays} from "@hooks/user/useGetUserParticipatedCleandays.tsx";
import {useGetUserOrganizedCleandays} from "@hooks/user/useGetUserOrganizedCleandays.tsx";
import {useGetMe} from "@hooks/authorization/useGetMe.tsx";

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
    // Хук для программной навигации между страницами
    const navigate = useNavigate();

    // Загрузка данных пользователя и его субботников
    const {data: userData, isLoading: isLoadingUser, error: userError} = useGetMe();
    const userId = userData.id || '';
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
    const isLoading = isLoadingUser || isLoadingParticipated || isLoadingOrganized;

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
    if (userError) {
        return (
            <Box className="user-profile-box" sx={{padding: 3}}>
                <Typography color="error" variant="h5">Error loading user data</Typography>
                <Typography>{userError.message}</Typography>
                <Button onClick={handleGoBack} variant="contained" startIcon={<ArrowBackIcon/>} sx={{mt: 2}}>
                    Обратно к списку пользователей
                </Button>
            </Box>
        );
    }

    // Отображение состояния, когда пользователь не найден
    if (!userData) {
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
    const levelStatus = getStatusByLevel(userData.level);

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
                        {userData.firstName} {userData.lastName}
                    </Typography>

                    {/* Блок с аватаром и полями профиля */}
                    <Box sx={{display: 'flex', alignItems: 'start', marginBottom: 3, width: '100%', maxWidth: 800,}}>
                        {/* Аватар пользователя */}
                        <Avatar style={avatarStyle}/>

                        {/* Поля с информацией о пользователе */}
                        <Box sx={{display: 'flex', flexDirection: 'column', width: '100%', maxWidth: "100%"}}>
                            <TextField label="Логин" value={userData.login} size="small" fullWidth={true} margin="dense"
                                       InputProps={{readOnly: true}}/>
                            <TextField label="Пол" value={userData.sex} size="small" margin="dense"
                                       InputProps={{readOnly: true}}/>
                            <TextField label="Город" value={userData.city} size="small" margin="dense"
                                       InputProps={{readOnly: true}}/>
                            <TextField
                                label="О себе"
                                value={userData.aboutMe || ''}
                                multiline
                                rows={5}
                                size="small"
                                margin="dense"
                                InputProps={{readOnly: true}}
                            />
                        </Box>
                    </Box>
                </Box>

                {/* Блок с уровнем, статистикой и кнопками действий */}
                <Box className={"user-profile-box-2"}>
                    {/* Отображение уровня пользователя */}
                    <Typography variant="h5" sx={{mt: 2}}>
                        Уровень - {levelStatus}
                    </Typography>

                    {/* Прогресс-бар, показывающий прогресс до следующего уровня */}
                    <Box sx={{display: 'flex', alignItems: 'center', width: '100%', maxWidth: 300, mt: 1}}>
                        <LinearProgress variant="determinate" color={"success"} value={userData.score % 50 * 2}
                                        sx={{flexGrow: 1, mr: 1}}/>
                        <Typography>{userData.score % 50} / 50</Typography>
                    </Box>

                    {/* Заголовок раздела статистики */}
                    <Typography variant="h5" sx={{mt: 3, mb: 1}}>
                        Статистика:
                    </Typography>

                    {/* Кнопки с информацией о количестве организованных и посещённых субботников */}
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
                            ОРГАНИЗОВАНО: {userData.organizedCount}
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
                            УЧАСТИЕ: {userData.participantsCount}
                        </Button>
                    </Box>

                    {/* Блок с метаданными пользователя и кнопкой редактирования */}
                    <Box sx={{display: 'flex', alignItems: 'center', width: '100%'}}>
                        <Box>
                            {/* Информация о статистике и метаданных пользователя */}
                            <Typography variant="body2" sx={{mb: 0.5}}>
                                Убрано территории - {userData.cleaned} м²
                            </Typography>
                            <Typography variant="body2" sx={{mb: 0.5}}>
                                Дата создания
                                - {userData.createdAt ? userData.createdAt.toLocaleString() : "Неизвестно"}
                            </Typography>
                            <Typography variant="body2" sx={{mb: 2}}>
                                Дата последнего изменения -
                                {userData.updatedAt ? userData.updatedAt.toLocaleString() : "Неизвестно"}
                            </Typography>
                            <Typography variant="body2" sx={{mb: 2}}>
                                ID: {userData.id}
                            </Typography>
                        </Box>

                        {/* Кнопка редактирования профиля - уникальная для страницы собственного профиля */}
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

                    {/* Кнопка возврата к списку пользователей */}
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

            {/* Компонент уведомления */}
            {notificationMessage && (
                <Notification
                    message={notificationMessage}
                    severity={notificationSeverity}
                    onClose={handleNotificationClose}
                />
            )}

            {/* Диалог редактирования профиля */}
            <EditUserProfileDialog
                open={editDialogOpen}
                onClose={handleEditDialogClose}
                onSubmit={handleEditDialogSubmit}
                profile={{
                    key: userData.id,
                    login: userData.login,
                    first_name: userData.firstName,
                    last_name: userData.lastName,
                    sex: userData.sex as Sex,
                    city: userData.city,
                    about_me: userData.aboutMe || '',
                    score: userData.score,
                    level: userData.level,
                    cleanday_count: userData.participantsCount,
                    organized_count: userData.organizedCount,
                    stat: userData.cleaned,
                    created_at: userData.createdAt?.toISOString() || '',
                    updated_at: userData.updatedAt?.toISOString() || '',
                }}
                cities={cities}
            />

            {/* Диалог организованных субботников */}
            <OrganizedCleandaysDialog
                open={organizedDialogOpen}
                onClose={() => setOrganizedDialogOpen(false)}
                userName={`${userData.firstName} ${userData.lastName}`}
                cleandays={organizedCleandays?.contents || []}
            />

            {/* Диалог посещённых субботников */}
            <ParticipatedCleandaysDialog
                open={participatedDialogOpen}
                onClose={() => setParticipatedDialogOpen(false)}
                userName={`${userData.firstName} ${userData.lastName}`}
                cleandays={participatedCleandays?.contents || []}
            />
        </Box>
    );
};

export default UserProfilePage;