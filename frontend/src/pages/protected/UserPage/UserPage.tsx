import React from 'react';
import {Avatar, Box, Button, CircularProgress, LinearProgress, TextField, Typography,} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {useNavigate, useParams} from 'react-router-dom';
import './UserPage.css';
import Notification from '@components/Notification.tsx';
import OrganizedCleandaysDialog from '@components/dialog/OrganizedCleandaysDialog';
import ParticipatedCleandaysDialog from '@components/dialog/ParticipatedCleandaysDialog';
import {getStatusByLevel} from "@utils/user/getStatusByLevel.ts";
import {useGetUserById} from "@hooks/user/useGetUserById.tsx";
import {useGetUserParticipatedCleandays} from "@hooks/user/useGetUserParticipatedCleandays.tsx";
import {useGetUserOrganizedCleandays} from "@hooks/user/useGetUserOrganizedCleandays.tsx";
import {useGetUserAvatar} from "@hooks/user/useGetUserAvatar.tsx";

/**
 * Стили для аватара пользователя.
 * Определяет размер и форму изображения профиля.
 */
const avatarStyle = {
    width: '230px',
    height: '300px',
    marginRight: '16px',
    borderRadius: '0',
};

/**
 * UserPage: Компонент страницы для отображения профиля пользователя.
 * Получает идентификатор пользователя из URL-параметров и отображает
 * детальную информацию о пользователе, включая личные данные и статистику участия в субботниках.
 *
 * @returns {JSX.Element} - Возвращает JSX-элемент, представляющий страницу профиля пользователя.
 */
const UserPage: React.FC = (): React.JSX.Element => {
    // Получение параметра id из URL для идентификации пользователя
    const {id} = useParams<{ id: string }>();
    const userId = id || '';

    // Fetch user data and cleandays data
    const {data: userData, isLoading: isLoadingUser, error: userError} = useGetUserById(userId);
    const {data: participatedCleandays, isLoading: isLoadingParticipated} = useGetUserParticipatedCleandays(userId);
    const {data: organizedCleandays, isLoading: isLoadingOrganized} = useGetUserOrganizedCleandays(userId);
    const {data: userAvatar, isLoading: isLoadingAvatar} = useGetUserAvatar(userId);

    // console.log("participatedCleandays = ", participatedCleandays.contents);

    // Хук для программной навигации между страницами
    const navigate = useNavigate();

    // Состояния для отображения уведомлений
    const [notificationMessage, setNotificationMessage] = React.useState<string | null>(null);
    const notificationSeverity: 'success' | 'info' | 'warning' | 'error' = 'success';

    // Состояние для отображения диалога организованных субботников
    const [organizedDialogOpen, setOrganizedDialogOpen] = React.useState<boolean>(false);
    // Состояние для отображения диалога посещённых субботников
    const [participatedDialogOpen, setParticipatedDialogOpen] = React.useState<boolean>(false);

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

    // Check if any data is still loading
    const isLoading = isLoadingUser || isLoadingParticipated || isLoadingOrganized || isLoadingAvatar;

    // Show loading state
    if (isLoading) {
        return (
            <Box className="user-profile-box"
                 sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh'}}>
                <CircularProgress/>
            </Box>
        );
    }

    // Show error state
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

    // Show not found state
    if (!userData) {
        return (
            <Box className="user-profile-box" sx={{padding: 3}}>
                <Typography variant="h5">Пользователь не найден</Typography>
                <Button onClick={handleGoBack} variant="contained" startIcon={<ArrowBackIcon/>} sx={{mt: 2}}>
                    Обратно к списку пользователей
                </Button>
            </Box>
        );
    }

    /**
     * Вычисляемое текстовое представление уровня пользователя.
     * Определяет статус пользователя на основе числового значения уровня.
     */
    const levelStatus = getStatusByLevel(userData.level);

    // Check if avatar is available and not a default image
    const avatarSrc = userAvatar && userAvatar.photo !== "default_image" ? userAvatar.photo : undefined;

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
                        <Avatar 
                            style={avatarStyle} 
                            src={avatarSrc} 
                            alt={`${userData.firstName} ${userData.lastName}`}
                        />

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

                {/* Блок с уровнем и статистикой пользователя */}
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

                    {/* Дополнительная информация о пользователе */}
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
                                Дата последнего изменения 
                                - {userData.updatedAt ? userData.updatedAt.toLocaleString() : "Неизвестно"}
                            </Typography>
                            <Typography variant="body2" sx={{mb: 2}}>
                                ID: {userData.id}
                            </Typography>
                        </Box>
                    </Box>
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

            {/* Компонент уведомления */}
            {notificationMessage && (
                <Notification
                    message={notificationMessage}
                    severity={notificationSeverity}
                    onClose={handleNotificationClose}
                />
            )}

            {/* Диалог организованных субботников */}
            <OrganizedCleandaysDialog
                open={organizedDialogOpen}
                onClose={() => setOrganizedDialogOpen(false)}
                userName={`${userData.firstName} ${userData.lastName}`}
                cleandays={organizedCleandays.contents || []}
            />

            {/* Диалог посещённых субботников */}
            <ParticipatedCleandaysDialog
                open={participatedDialogOpen}
                onClose={() => setParticipatedDialogOpen(false)}
                userName={`${userData.firstName} ${userData.lastName}`}
                cleandays={participatedCleandays.contents || []}
            />
        </Box>
    );
};

export default UserPage;