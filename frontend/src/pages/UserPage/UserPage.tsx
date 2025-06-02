import React from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Avatar,
    LinearProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {useParams, useNavigate} from 'react-router-dom';
import './UserPage.css';
import {UserProfile} from "../../models/User.ts";
import Notification from '../../components/Notification.tsx';

// TODO: Реализуйте запрос
/**
 * Моковые данные пользовательского профиля для демонстрации.
 * В реальном приложении эти данные будут загружаться с сервера по идентификатору пользователя.
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
    // Получение параметра 'key' из URL для идентификации пользователя
    const { key } = useParams<{ key: string }>();

    // Хук для программной навигации между страницами
    const navigate = useNavigate();

    // Состояние для хранения данных профиля пользователя
    const [profile, setProfile] = React.useState<UserProfile>(initialUserProfile); // Заглушка

    // Состояния для отображения уведомлений
    const [notificationMessage, setNotificationMessage] = React.useState<string | null>(null);
    const [notificationSeverity, setNotificationSeverity] = React.useState<'success' | 'info' | 'warning' | 'error'>('success');

    /**
     * Эффект для загрузки данных пользователя при монтировании компонента
     * или изменении идентификатора пользователя в URL.
     * В текущей реализации только выводит сообщение в консоль.
     * В реальном приложении здесь был бы запрос к API.
     */
    React.useEffect(() => {
        if (key) {
            console.log(`Fetching user data for key: ${key}`);
        }
    }, [key]);

    /**
     * Вычисляемое текстовое представление уровня пользователя.
     * Определяет статус пользователя на основе числового значения уровня.
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
                    <Box sx={{display: 'flex', alignItems: 'start', marginBottom: 3, width: '100%', maxWidth: 800,}}>
                        {/* Аватар пользователя */}
                        <Avatar style={avatarStyle}/>

                        {/* Поля с информацией о пользователе */}
                        <Box sx={{display: 'flex', flexDirection: 'column', width: '100%', maxWidth: "100%"}}>
                            <TextField label="Логин" value={profile.login} size="small" fullWidth={true} margin="dense"
                                       InputProps={{readOnly: true}}/>
                            <TextField label="Пол" value={profile.sex} size="small" margin="dense"
                                       InputProps={{readOnly: true}}/>
                            <TextField label="Город" value={profile.city} size="small" margin="dense"
                                       InputProps={{readOnly: true}}/>
                            <TextField
                                label="О себе"
                                value={profile.about_me}
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
                        <LinearProgress variant="determinate" color={"success"} value={profile.score % 50 * 2}
                                        sx={{flexGrow: 1, mr: 1}}/>
                        <Typography>{profile.score % 50} / 50</Typography> {/* Assuming level 1-10 maps to 0-100% */}
                    </Box>

                    {/* Заголовок раздела статистики */}
                    <Typography variant="h5" sx={{mt: 3, mb: 1}}>
                        Статистика:
                    </Typography>

                    {/* Кнопки с информацией о количестве организованных и посещённых субботников */}
                    <Box sx={{display: 'flex', gap: 1, mb: 2}}>
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

                    {/* Дополнительная информация о пользователе */}
                    <Box sx={{display: 'flex', alignItems: 'center', width: '100%'}}>
                        <Box>
                            {/* Информация о статистике и метаданных пользователя */}
                            <Typography variant="body2" sx={{mb: 0.5}}>
                                Убрано территории - {profile.stat}
                            </Typography>
                            <Typography variant="body2" sx={{mb: 0.5}}>
                                Дата создания - {profile.created_at}
                            </Typography>
                            <Typography variant="body2" sx={{mb: 2}}>
                                Дата последнего изменения - {profile.updated_at}
                            </Typography>
                            <Typography variant="body2" sx={{mb: 2}}>
                                ID: {profile.key}
                            </Typography>
                        </Box>
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
        </Box>
    );
};

export default UserPage;