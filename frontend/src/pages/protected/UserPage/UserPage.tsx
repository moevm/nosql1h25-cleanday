import React from 'react';
import {Avatar, Box, Button, CircularProgress, LinearProgress, TextField, Typography,} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {useNavigate, useParams} from 'react-router-dom';
import './UserPage.css';
import {Cleanday, CleandayTag} from "@models/Cleanday.ts";
// import {Sex, User} from "@models/User.ts";
import Notification from '@components/Notification.tsx';
import OrganizedCleandaysDialog from '@components/dialog/OrganizedCleandaysDialog';
import ParticipatedCleandaysDialog from '@components/dialog/ParticipatedCleandaysDialog';
import {getStatusByLevel} from "@utils/user/getStatusByLevel.ts";
import {useGetUserById} from "@hooks/user/useGetUserById.tsx";

// TODO: Реализуйте запрос
/**
 * Моковые данные пользовательского профиля для демонстрации.
 * В реальном приложении эти данные будут загружаться с сервера по идентификатору пользователя.
 */
// const initialUserProfile: User = {
//     // key: "user123",
//     key: "user123",
//     login: "john.doe",
//     first_name: "Ритка",
//     last_name: "Doe",
//     sex: Sex.male,
//     city: "Rome",
//     about_me: "Loves to keep things tidy!",
//     score: 275,
//     level: 5,
//     cleanday_count: 5,
//     organized_count: 10,
//     stat: 15,
//     created_at: "2025-05-20T10:00:00Z",
//     updated_at: "2025-05-25T14:30:00Z",
// };

/**
 * Моковые данные субботников, организованных пользователем для демонстрации.
 * В реальном приложении эти данные будут загружаться с сервера.
 */
const organizedCleandaysData: Cleanday[] = [
    {
        key: "CD-001",
        name: "Весенняя уборка парка",
        description: "Приглашаем всех на уборку центрального парка!",
        participant_count: 25,
        recommended_count: 30,
        city: "Москва",
        location: {address: "Парк Горького", instructions: "У центрального входа", key: 101, city: "Москва"},
        begin_date: "2025-04-15",
        end_date: "2025-04-15",
        organizer: "John Doe",
        organization: "Зеленый Город",
        area: 1500,
        tags: [CleandayTag.trashCollecting, CleandayTag.lawnSetup],
        status: "Завершен",
        requirements: ["Перчатки", "Удобная обувь"],
        created_at: "2025-04-01T10:00:00Z",
        updated_at: "2025-04-16T12:30:00Z",
    },
    {
        key: "CD-004",
        name: "Очистка городского пляжа",
        description: "Сбор мусора на пляже после летнего сезона",
        participant_count: 15,
        recommended_count: 20,
        city: "Сочи",
        location: {address: "Центральный пляж", instructions: "У спасательной вышки", key: 302, city: "Сочи"},
        begin_date: "2025-09-10",
        end_date: "2025-09-10",
        organizer: "John Doe",
        organization: "Чистые берега",
        area: 2000,
        tags: [CleandayTag.trashCollecting, CleandayTag.plantCare],
        status: "Запланировано",
        requirements: ["Перчатки", "Солнцезащитные средства"],
        created_at: "2025-08-15T14:20:00Z",
        updated_at: "2025-08-18T09:45:00Z",
    }
];

/**
 * Моковые данные субботников, в которых пользователь принял участие для демонстрации.
 * В реальном приложении эти данные будут загружаться с сервера.
 */
const participatedCleandaysData: Cleanday[] = [
    {
        key: "CD-002",
        name: "Чистый берег реки",
        description: "Очистим берег реки от мусора вместе!",
        participant_count: 18,
        recommended_count: 20,
        city: "Санкт-Петербург",
        location: {
            address: "Набережная реки Фонтанки",
            instructions: "У моста Белинского",
            key: 205,
            city: "Санкт-Петербург"
        },
        begin_date: "2025-05-20",
        end_date: "2025-05-20",
        organizer: "Петрова А.С.",
        organization: "Эко-Патруль СПб",
        area: 800,
        tags: [CleandayTag.trashCollecting, CleandayTag.plantCare],
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
        location: {
            address: "Сквер у Оперного театра",
            instructions: "За главным зданием",
            key: 310,
            city: "Новосибирск"
        },
        begin_date: "2025-06-10",
        end_date: "2025-06-10",
        organizer: "Сидоров В.К.",
        organization: "Зеленый Новосибирск",
        area: 500,
        tags: [CleandayTag.painting],
        status: "Запланировано",
        requirements: ["Лопаты (если есть)"],
        created_at: "2025-05-25T11:30:00Z",
        updated_at: "2025-05-28T16:45:00Z",
    },
];

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
    const {id} = useParams<{ id: string }>();
    const {data: userData, isLoading, error} = useGetUserById(id || '');

    // Хук для программной навигации между страницами
    const navigate = useNavigate();

    // Состояние для хранения данных профиля пользователя
    // const [profile, setProfile] = React.useState<UserProfile>(initialUserProfile); // Заглушка

    // Состояния для отображения уведомлений
    const [notificationMessage, setNotificationMessage] = React.useState<string | null>(null);
    const [notificationSeverity] = React.useState<'success' | 'info' | 'warning' | 'error'>('success');


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
    if (error) {
        return (
            <Box className="user-profile-box" sx={{padding: 3}}>
                <Typography color="error" variant="h5">Error loading user data</Typography>
                <Typography>{error.message}</Typography>
                <Button onClick={handleGoBack} variant="contained" startIcon={<ArrowBackIcon/>} sx={{mt: 2}}>
                    Back to users list
                </Button>
            </Box>
        );
    }

    // Show not found state
    if (!userData) {
        return (
            <Box className="user-profile-box" sx={{padding: 3}}>
                <Typography variant="h5">User not found</Typography>
                <Button onClick={handleGoBack} variant="contained" startIcon={<ArrowBackIcon/>} sx={{mt: 2}}>
                    Back to users list
                </Button>
            </Box>
        );
    }

    /**
     * Вычисляемое текстовое представление уровня пользователя.
     * Определяет статус пользователя на основе числового значения уровня.
     */
    console.log(userData);
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
                                value={userData.aboutMe}
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
                        <Typography>{userData.score % 50} / 50</Typography> {/* Assuming level 1-10 maps to 0-100% */}
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
                                Убрано территории - {userData.cleaned}
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
                cleandays={organizedCleandaysData}
            />

            {/* Диалог посещённых субботников */}
            <ParticipatedCleandaysDialog
                open={participatedDialogOpen}
                onClose={() => setParticipatedDialogOpen(false)}
                userName={`${userData.firstName} ${userData.lastName}`}
                cleandays={participatedCleandaysData}
            />
        </Box>
    );
};

export default UserPage;