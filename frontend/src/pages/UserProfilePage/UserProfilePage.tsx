import React from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Avatar,
    LinearProgress,
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import './UserProfilePage.css';
import { UserProfile, UserProfileEdit } from "../../models/User.ts";
import Notification from '../../components/Notification.tsx';
import { useNavigate } from "react-router-dom";
import EditUserProfileDialog from "../../components/dialog/EditUserProfileDialog.tsx";


// TODO: Реализуйте запрос
/**
 * Моковые данные профиля пользователя для демонстрации.
 * В реальном приложении эти данные будут загружаться с сервера на основе
 * аутентификации пользователя или параметра из URL.
 */
const initialUserProfile: UserProfile = {
    key: "user123",
    login: "john.doe",
    first_name: "John",
    last_name: "Doe",
    sex: "male",
    city: "Rome",
    about_me: "Loves to keep things tidy!",
    score: 275,
    level: 5,
    cleanday_count: 5,
    organized_count: 10,
    stat: 15,
    created_at: "2025-05-20T10:00:00Z",
    updated_at: "2025-05-25T14:30:00Z",
};

// TODO: Реализуйте запрос
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

    // Состояние для хранения данных профиля пользователя
    const [profile, setProfile] = React.useState<UserProfile>(initialUserProfile);

    // Состояния для отображения уведомлений
    const [notificationMessage, setNotificationMessage] = React.useState<string | null>(null);
    const [notificationSeverity, setNotificationSeverity] = React.useState<'success' | 'info' | 'warning' | 'error'>('success');

    // Состояние для управления видимостью диалога редактирования профиля
    const [editDialogOpen, setEditDialogOpen] = React.useState(false);

    /**
     * Вычисляемый статус уровня пользователя на основе числового значения.
     * Возвращает текстовое описание с эмодзи, соответствующее уровню пользователя.
     */
    const levelStatus = React.useMemo(() => {
        if (profile.level == 1) {
            return 'Новичок👍';
        } else if (profile.level == 2) {
            return 'Труженик💪';
        } else if (profile.level == 3) {
            return 'Лидер района🤝';
        } else if (profile.level == 4) {
            return 'Экоактивист🌱';
        } else if (profile.level == 5) {
            return 'Экозвезда🌟';
        } else {
            return 'Эко-гуру🏆';
        }
    }, [profile.level]);

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
        setProfile(prev => ({
            ...prev,
            ...data,
            updated_at: new Date().toISOString() // Обновляем дату изменения
        }));
        setNotificationMessage('Профиль успешно обновлён!');
        setNotificationSeverity('success');
        setEditDialogOpen(false);
    };

    /**
     * Обработчик нажатия на кнопку участия в субботнике.
     * В данной реализации только отображает информационное уведомление о разработке функционала.
     */
    const handleParticipateInSubbotnik = () => {
        setNotificationMessage('Функционал записи на субботник в разработке.');
        setNotificationSeverity('info');
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

    return (
        <Box className={"user-profile-box"}>
            <Box display='flex' flexDirection='column' alignItems='flex-start'>
                {/* Кнопка возврата к списку пользователей */}
                <Button onClick={handleGoBack} startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
                    Назад к списку пользователей
                </Button>

                {/* Контейнер с основной информацией о пользователе */}
                <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    width: '700px'
                }}>
                    {/* Имя и фамилия пользователя */}
                    <Typography variant="h3" gutterBottom>
                        {profile.first_name} {profile.last_name}
                    </Typography>

                    {/* Блок с аватаром и полями профиля */}
                    <Box sx={{ display: 'flex', alignItems: 'start', marginBottom: 3, width: '100%', maxWidth: 800, }}>
                        {/* Аватар пользователя */}
                        <Avatar style={avatarStyle} />

                        {/* Поля с информацией о пользователе */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: "100%" }}>
                            <TextField label="Логин" value={profile.login} size="small" fullWidth={true} margin="dense"
                                       InputProps={{ readOnly: true }} />
                            <TextField label="Пол" value={profile.sex} size="small" margin="dense"
                                       InputProps={{ readOnly: true }} />
                            <TextField label="Город" value={profile.city} size="small" margin="dense"
                                       InputProps={{ readOnly: true }} />
                            <TextField
                                label="О себе"
                                value={profile.about_me}
                                multiline
                                rows={5}
                                size="small"
                                margin="dense"
                                InputProps={{ readOnly: true }}
                            />
                        </Box>
                    </Box>
                </Box>

                {/* Блок с уровнем, статистикой и кнопками действий */}
                <Box className={"user-profile-box-2"}>
                    {/* Отображение уровня пользователя */}
                    <Typography variant="h5" sx={{ mt: 2 }}>
                        Уровень - {levelStatus}
                    </Typography>

                    {/* Прогресс-бар, показывающий прогресс до следующего уровня */}
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: 300, mt: 1 }}>
                        <LinearProgress variant="determinate" color={"success"} value={profile.score % 50 * 2}
                                        sx={{ flexGrow: 1, mr: 1 }} />
                        <Typography>{profile.score % 50} / 50</Typography>
                    </Box>

                    {/* Заголовок раздела статистики */}
                    <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>
                        Статистика:
                    </Typography>

                    {/* Кнопки с информацией о количестве организованных и посещённых субботников */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Button variant="contained" color="success"
                                sx={{
                                    backgroundColor: '#3C6C5F',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: '#345e51',
                                    },
                                    height: '45px',
                                    width: '190px',
                                }}>
                            ОРГАНИЗОВАНО: {profile.organized_count}
                        </Button>
                        <Button variant="contained" color="success"
                                sx={{
                                    backgroundColor: '#3C6C5F',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: '#345e51',
                                    },
                                    height: '45px',
                                    width: '190px',
                                }}>
                            УЧАСТИЕ: {profile.cleanday_count}
                        </Button>
                    </Box>

                    {/* Блок с метаданными пользователя и кнопкой редактирования */}
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Box>
                            {/* Информация о статистике и метаданных пользователя */}
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                Убрано территории - {profile.stat}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                Дата создания - {profile.created_at}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                                Дата последнего изменения - {profile.updated_at}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                                ID: {profile.key}
                            </Typography>
                        </Box>

                        {/* Кнопка редактирования профиля */}
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleEditProfile}
                            startIcon={<EditIcon />}
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

                    {/* Блок с кнопкой изменения участия в субботнике */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="contained"
                            onClick={handleParticipateInSubbotnik}
                            startIcon={<ArrowBackIcon />}
                            sx={{
                                backgroundColor: '#3C6C5F',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: '#345e51',
                                },
                                height: '45px',
                                width: '100%',
                            }}
                        >
                            Изменить участие в субботнике
                        </Button>
                    </Box>

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
                profile={profile}
                cities={cities}
            />
        </Box>
    );
};

export default UserProfilePage;