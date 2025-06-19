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
import {useUpdateUserInfo} from "@hooks/user/useUpdateUserInfo";
import {useUpdateUserAvatar} from "@hooks/user/useUpdateUserAvatar";
import {useQueryClient} from "@tanstack/react-query";
import {fileToBase64} from "@utils/files/fileToBase64";
import {useGetUserAvatar} from "@hooks/user/useGetUserAvatar";
import {useGetAllCities} from "@hooks/city/useGetAllCities";

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
 * UserProfilePage: Компонент страницы профиля текущего пользователя.
 * Отображает личную информацию, статистику и предоставляет функциональность
 * для редактирования профиля и участия в субботниках.
 *
 * @returns {JSX.Element} - Возвращает JSX-элемент, представляющий страницу профиля пользователя.
 */
const UserProfilePage: React.FC = (): React.JSX.Element => {
    // IMPORTANT: All React hooks must be called at the top level before any conditional returns
    
    // Получаем данные текущего пользователя
    const {data: currentUser, isLoading: isLoadingCurrentUser, error: currentUserError, refetch: refetchUser} = useGetMe();

    // Add local state to immediately update UI after changes - moved this up before any conditionals
    const [localUserData, setLocalUserData] = React.useState<typeof currentUser | null>(null);

    // Get cities from API
    const {data: citiesData, isLoading: isLoadingCities} = useGetAllCities();
    
    // Хук для программной навигации между страницами
    const navigate = useNavigate();
    
    // Query client для инвалидации кэша
    const queryClient = useQueryClient();

    // Загрузка данных субботников пользователя только после того, как получены данные пользователя
    const userId = currentUser?.id || '';
    const {
        data: participatedCleandays, 
        isLoading: isLoadingParticipated
    } = useGetUserParticipatedCleandays(userId);
    
    const {
        data: organizedCleandays, 
        isLoading: isLoadingOrganized
    } = useGetUserOrganizedCleandays(userId);
    
    const {
        data: userAvatar, 
        isLoading: isLoadingAvatar, 
        refetch: refetchAvatar
    } = useGetUserAvatar(userId);

    // State for avatar preview during editing - this should ONLY be used in the dialog
    const [avatarPreview, setAvatarPreview] = React.useState<string | undefined>(undefined);

    // Состояния для отображения уведомлений
    const [notificationMessage, setNotificationMessage] = React.useState<string | null>(null);
    const [notificationSeverity, setNotificationSeverity] = React.useState<'success' | 'info' | 'warning' | 'error'>('success');

    // Состояние для управления видимостью диалога редактирования профиля
    const [editDialogOpen, setEditDialogOpen] = React.useState(false);

    // Состояние для отображения диалога организованных субботников
    const [organizedDialogOpen, setOrganizedDialogOpen] = React.useState<boolean>(false);

    // Состояние для отображения диалога посещённых субботников
    const [participatedDialogOpen, setParticipatedDialogOpen] = React.useState<boolean>(false);
    
    // Состояние для хранения файла аватара
    const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
    
    // Хуки для обновления данных пользователя
    const updateUserInfo = useUpdateUserInfo(userId);
    const updateUserAvatar = useUpdateUserAvatar(userId);

    // Update local state when currentUser changes
    React.useEffect(() => {
        if (currentUser) {
            setLocalUserData(currentUser);
        }
    }, [currentUser]);

    // Reset avatar preview when dialog closes
    React.useEffect(() => {
        if (!editDialogOpen) {
            setAvatarPreview(undefined);
        }
    }, [editDialogOpen]);

    // Create city names array and a mapping from name to ID for later use
    const cityNames = React.useMemo(() => {
        return citiesData?.map(city => city.name) || [];
    }, [citiesData]);
    
    const cityNameToIdMap = React.useMemo(() => {
        const map: Record<string, string> = {};
        citiesData?.forEach(city => {
            map[city.name] = city.id;
        });
        return map;
    }, [citiesData]);

    // Use local state if available, otherwise fall back to query data
    const displayUser = localUserData || currentUser;

    /**
     * Обработчик нажатия на кнопку редактирования профиля.
     * Открывает диалоговое окно для редактирования данных профиля.
     */
    const handleEditProfile = () => {
        setEditDialogOpen(true);
        setAvatarFile(null); // Сбрасываем состояние файла аватара при открытии диалога
        setAvatarPreview(undefined); // Reset preview when opening dialog
    };

    /**
     * Обработчик закрытия диалога редактирования профиля.
     * Закрывает диалоговое окно без сохранения изменений.
     */
    const handleEditDialogClose = () => {
        setEditDialogOpen(false);
        setAvatarFile(null); // Clear avatar file on cancel
        setAvatarPreview(undefined); // Clear preview on cancel
    };

    /**
     * Обработчик обновления аватара пользователя.
     * 
     * @param {File} file - Файл нового аватара пользователя.
     */
    const handleUserPicChange = async (file: File) => {
        setAvatarFile(file);
        
        // Generate preview for immediate feedback IN THE DIALOG ONLY
        try {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error generating avatar preview:', error);
        }
    };

    /**
     * Обработчик отправки формы редактирования профиля.
     * Обновляет профиль пользователя, закрывает диалоговое окно и показывает уведомление об успехе.
     *
     * @param {UserProfileEdit} data - Обновленные данные профиля пользователя.
     */
    const handleEditDialogSubmit = async (data: UserProfileEdit) => {
        try {
            // Create a copy of the data to modify
            const updatedData = { ...data };
            
            // If city is provided, convert it to city_id
            if (updatedData.city && cityNameToIdMap[updatedData.city]) {
                updatedData.city_id = cityNameToIdMap[updatedData.city];
                // Remove the city field as the backend expects city_id
                delete updatedData.city;
            }
            
            // Immediately update local state for instant feedback
            if (displayUser) {
                const cityName = updatedData.city_id 
                    ? citiesData?.find(c => c.id === updatedData.city_id)?.name || displayUser.city
                    : displayUser.city;
                
                setLocalUserData({
                    ...displayUser,
                    firstName: updatedData.first_name || displayUser.firstName,
                    lastName: updatedData.last_name || displayUser.lastName,
                    sex: updatedData.sex || displayUser.sex,
                    city: cityName,
                    aboutMe: updatedData.about_me !== undefined ? updatedData.about_me : displayUser.aboutMe,
                    // Keep other fields unchanged
                });
            }
            
            // Обновляем данные пользователя
            await updateUserInfo.mutateAsync(updatedData, {
                onSuccess: async () => {
                    // Immediately refetch user data to get the latest from the server
                    await refetchUser();
                    
                    // Also invalidate the cache to ensure other components get updated data
                    queryClient.invalidateQueries({ queryKey: ['currentUser'] });
                    
                    setNotificationMessage('Профиль успешно обновлён!');
                    setNotificationSeverity('success');
                },
                onError: (error) => {
                    console.error('Error updating profile:', error);
                    setNotificationMessage('Ошибка при обновлении профиля');
                    setNotificationSeverity('error');
                    
                    // Reset local data on error
                    if (currentUser) {
                        setLocalUserData(currentUser);
                    }
                }
            });
            
            // Если есть новый файл аватара, отправляем его
            if (avatarFile) {
                try {
                    const base64String = await fileToBase64(avatarFile);
                    
                    await updateUserAvatar.mutateAsync({ photo: base64String }, {
                        onSuccess: async () => {
                            // Refetch avatar data specifically
                            await refetchAvatar();
                            
                            // Update local avatar preview - this allows us to see the change immediately
                            if (base64String) {
                                // Create a temporary avatar object to simulate the API response
                                const tempAvatar = { photo: base64String };
                                
                                // Force the UI to update with the new avatar
                                queryClient.setQueryData(['userAvatar', userId], tempAvatar);
                            }
                            
                            setNotificationMessage('Профиль и аватар успешно обновлены!');
                            setNotificationSeverity('success');
                        },
                        onError: (error) => {
                            console.error('Error updating avatar:', error);
                            setNotificationMessage('Профиль обновлен, но возникла ошибка при обновлении аватара');
                            setNotificationSeverity('warning');
                        }
                    });
                } catch (error) {
                    console.error('Error converting image to base64:', error);
                    setNotificationMessage('Ошибка при обработке изображения');
                    setNotificationSeverity('error');
                }
            }
            
            setEditDialogOpen(false);
            // Clear the avatar file and preview after submission
            setAvatarFile(null);
            setAvatarPreview(undefined);
            
        } catch (error) {
            console.error('Error in edit dialog submit:', error);
            setNotificationMessage('Ошибка при обновлении профиля');
            setNotificationSeverity('error');
            
            // Reset local data on error
            if (currentUser) {
                setLocalUserData(currentUser);
            }
        }
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
    const isLoading = isLoadingCurrentUser || isLoadingParticipated || isLoadingOrganized || isLoadingAvatar || isLoadingCities;

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
    if (!displayUser) {
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
    const levelStatus = getStatusByLevel(displayUser.level);

    // Determine avatar source - DO NOT use avatarPreview for the main page avatar
    // Only use the actual data from the API
    const avatarSrc = (userAvatar && userAvatar.photo !== "default_image") 
        ? userAvatar.photo 
        : undefined;

    // Use displayUser instead of currentUser throughout the render function
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
                        {displayUser.firstName} {displayUser.lastName}
                    </Typography>

                    {/* Блок с аватаром и полями профиля */}
                    <Box sx={{display: 'flex', alignItems: 'start', marginBottom: 3, width: '100%', maxWidth: 800,}}>
                        <Avatar 
                            style={avatarStyle} 
                            src={avatarSrc} // Only use the real avatar from API, not the preview
                            alt={`${displayUser.firstName} ${displayUser.lastName}`}
                        />

                        <Box sx={{display: 'flex', flexDirection: 'column', width: '100%', maxWidth: "100%"}}>
                            <TextField label="Логин" value={displayUser.login} size="small" fullWidth={true}
                                       margin="dense"
                                       InputProps={{readOnly: true}}/>
                            <TextField label="Пол" value={displayUser.sex} size="small" margin="dense"
                                       InputProps={{readOnly: true}}/>
                            <TextField label="Город" value={displayUser.city} size="small" margin="dense"
                                       InputProps={{readOnly: true}}/>
                            <TextField
                                label="О себе"
                                value={displayUser.aboutMe || ''}
                                multiline
                                rows={5}
                                size="small"
                                margin="dense"
                                InputProps={{readOnly: true}}
                            />
                        </Box>
                    </Box>
                </Box>

                {/* Остальная часть компонента, также заменяющая userData на displayUser */}
                <Box className={"user-profile-box-2"}>
                    <Typography variant="h5" sx={{mt: 2}}>
                        Уровень - {levelStatus}
                    </Typography>

                    <Box sx={{display: 'flex', alignItems: 'center', width: '100%', maxWidth: 300, mt: 1}}>
                        <LinearProgress variant="determinate" color={"success"} value={displayUser.score % 50 * 2}
                                        sx={{flexGrow: 1, mr: 1}}/>
                        <Typography>{displayUser.score % 50} / 50</Typography>
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
                            ОРГАНИЗОВАНО: {displayUser.organizedCount}
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
                            УЧАСТИЕ: {displayUser.participantsCount}
                        </Button>
                    </Box>

                    <Box sx={{display: 'flex', alignItems: 'center', width: '100%'}}>
                        <Box>
                            <Typography variant="body2" sx={{mb: 0.5}}>
                                Убрано территории - {displayUser.cleaned} м²
                            </Typography>
                            <Typography variant="body2" sx={{mb: 0.5}}>
                                Дата создания
                                - {displayUser.createdAt ? displayUser.createdAt.toLocaleString() : "Неизвестно"}
                            </Typography>
                            <Typography variant="body2" sx={{mb: 2}}>
                                Дата последнего изменения 
                                - {displayUser.updatedAt ? displayUser.updatedAt.toLocaleString() : "Неизвестно"}
                            </Typography>
                            <Typography variant="body2" sx={{mb: 2}}>
                                ID: {displayUser.id}
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
                    key: displayUser.id,
                    login: displayUser.login,
                    first_name: displayUser.firstName,
                    last_name: displayUser.lastName,
                    sex: displayUser.sex as Sex,
                    city: displayUser.city,
                    about_me: displayUser.aboutMe || '',
                    score: displayUser.score,
                    level: displayUser.level,
                    cleanday_count: displayUser.participantsCount,
                    organized_count: displayUser.organizedCount,
                    stat: displayUser.cleaned,
                    created_at: displayUser.createdAt?.toISOString() || '',
                    updated_at: displayUser.updatedAt?.toISOString() || '',
                }}
                cities={cityNames}
                userPic={avatarPreview ? { photo: avatarPreview } : 
                    (userAvatar ? { photo: userAvatar.photo } : null)}
                onUserPicChange={handleUserPicChange}
            />

            <OrganizedCleandaysDialog
                open={organizedDialogOpen}
                onClose={() => setOrganizedDialogOpen(false)}
                userName={`${displayUser.firstName} ${displayUser.lastName}`}
                cleandays={organizedCleandays?.contents || []}
            />

            <ParticipatedCleandaysDialog
                open={participatedDialogOpen}
                onClose={() => setParticipatedDialogOpen(false)}
                userName={`${displayUser.firstName} ${displayUser.lastName}`}
                cleandays={participatedCleandays?.contents || []}
            />
        </Box>
    );
};

export default UserProfilePage;