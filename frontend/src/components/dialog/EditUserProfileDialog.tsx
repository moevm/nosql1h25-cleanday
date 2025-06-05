import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
    Typography,
    Box,
    FormHelperText,
    Grid,
    Autocomplete,
} from '@mui/material';

import { UserProfile, UserProfileEdit, UserPic } from '@models/deleteMeLater.ts';

/**
 * Интерфейс для пропсов компонента EditUserProfileDialog.
 * Определяет, какие данные компонент принимает от родительского элемента.
 * @param {boolean} open - Определяет, открыт ли диалог.
 * @param {() => void} onClose - Функция, вызываемая при закрытии диалога.
 * @param {(data: UserProfileEdit) => void} onSubmit - Функция, вызываемая при сохранении изменений профиля. Принимает обновленные данные пользователя.
 * @param {UserProfile} profile - Объект профиля пользователя для редактирования.
 * @param {string[]} cities - Массив названий городов для выбора.
 * @param {UserPic | null | undefined} userPic - Фото пользователя, если есть.
 * @param {(file: File) => void} onUserPicChange - Функция для обновления фото пользователя.
 */
interface UserProfileEditDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: UserProfileEdit) => void;
    profile: UserProfile;
    cities: string[];
    userPic?: UserPic | null; // Фото пользователя, если есть
    onUserPicChange?: (file: File) => void; // Функция для обновления фото пользователя
}

/**
 * Функция для создания начального состояния формы на основе профиля пользователя.
 * Инициализирует все поля формы данными из профиля пользователя.
 *
 * @param {UserProfile} profile - Профиль пользователя.
 * @returns {Object} Объект с начальным состоянием формы.
 */
const getDefaultFormState = (profile: UserProfile) => ({
    login: profile.login,
    password: '',
    confirmPassword: '',
    first_name: profile.first_name,
    last_name: profile.last_name,
    city: profile.city,
    about_me: profile.about_me || '',
    sex: profile.sex,
    errors: {} as { [key: string]: string },
});

/**
 * EditUserProfileDialog: Компонент для редактирования профиля пользователя.
 * Предоставляет форму для изменения личной информации пользователя, включая загрузку аватара.
 *
 * @param {UserProfileEditDialogProps} props - Пропсы компонента.
 * @returns {JSX.Element} - Возвращает JSX-элемент, представляющий диалоговое окно редактирования профиля.
 */
const EditUserProfileDialog: React.FC<UserProfileEditDialogProps> = ({
                                                                         open,
                                                                         onClose,
                                                                         onSubmit,
                                                                         profile,
                                                                         cities,
                                                                         userPic,
                                                                         onUserPicChange,
                                                                     }: UserProfileEditDialogProps): React.JSX.Element => {
    // Состояние формы, инициализируется данными из профиля пользователя
    const [formState, setFormState] = React.useState(getDefaultFormState(profile));

    // Состояние для отслеживания перетаскивания файлов на область загрузки аватара
    const [dragActive, setDragActive] = React.useState(false);

    // Состояние для отображения превью аватара
    const [avatarPreview, setAvatarPreview] = React.useState<string>(
        userPic?.photo || ''
    );

    /**
     * useEffect hook для обновления состояния формы при изменении данных профиля или открытии диалога.
     * Сбрасывает форму и заполняет её данными из переданного профиля.
     */
    React.useEffect(() => {
        if (open) {
            setFormState(getDefaultFormState(profile));
            setAvatarPreview(userPic?.photo || '');
        }
    }, [open, profile, userPic]);

    // Деструктуризация состояния формы для удобства доступа к полям
    const {
        login,
        password,
        confirmPassword,
        first_name,
        last_name,
        city,
        about_me,
        sex,
        errors,
    } = formState;

    /**
     * Функция для валидации формы.
     * Проверяет заполненность обязательных полей и корректность введенных данных.
     *
     * @returns {boolean} - Возвращает `true`, если форма валидна, и `false` в противном случае.
     */
    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        // Проверка обязательных полей и добавление ошибок в объект newErrors
        if (!first_name) newErrors.first_name = 'Введите имя';
        if (!last_name) newErrors.last_name = 'Введите фамилию';
        if (!login) newErrors.login = 'Введите логин';
        if (password && password.length < 6) newErrors.password = 'Пароль слишком короткий';
        if (password !== confirmPassword) newErrors.confirmPassword = 'Пароли не совпадают';
        if (!city) newErrors.city = 'Выберите город';
        if (!sex) newErrors.sex = 'Выберите пол';
        if (about_me.length > 500) newErrors.about_me = 'Максимум 500 символов';

        // Обновление состояния формы с ошибками валидации
        setFormState(prev => ({ ...prev, errors: newErrors }));

        // Возвращаем true, если ошибок нет
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Обработчик изменения текстовых полей формы.
     * Обновляет соответствующее поле в состоянии формы.
     *
     * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - Событие изменения значения поля.
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    /**
     * Обработчик изменения значения радиогруппы (выбор пола).
     * Обновляет поле sex в состоянии формы.
     *
     * @param {React.ChangeEvent<HTMLInputElement>} e - Событие изменения значения радиокнопки.
     */
    const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormState(prev => ({ ...prev, sex: e.target.value as "female" | "male" | "other" }));
    };

    /**
     * Обработчик события перетаскивания файла над областью загрузки (dragover).
     * Активирует визуальное выделение области загрузки.
     *
     * @param {React.DragEvent<HTMLDivElement>} event - Событие перетаскивания.
     */
    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragActive(true);
    };

    /**
     * Обработчик события ухода перетаскиваемого файла из области загрузки (dragleave).
     * Деактивирует визуальное выделение области загрузки.
     *
     * @param {React.DragEvent<HTMLDivElement>} event - Событие перетаскивания.
     */
    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragActive(false);
    };

    /**
     * Обработчик события сброса файла в области загрузки (drop).
     * Обрабатывает загруженный файл и деактивирует визуальное выделение.
     *
     * @param {React.DragEvent<HTMLDivElement>} event - Событие перетаскивания.
     */
    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragActive(false);
        // Проверка наличия файлов в событии перетаскивания
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            handleFile(event.dataTransfer.files[0]);
        }
    };

    /**
     * Функция обработки загруженного файла изображения.
     * Проверяет тип и размер файла, отображает превью и вызывает функцию обновления аватара.
     *
     * @param {File} file - Загруженный файл изображения.
     */
    const handleFile = (file: File) => {
        // Проверка типа файла (должен быть изображением)
        if (!file.type.match(/image\/(svg\+xml|png|jpeg|jpg|gif)/)) {
            setFormState(prev => ({
                ...prev,
                errors: { ...prev.errors, avatar: 'Недопустимый тип файла' }
            }));
            return;
        }

        // Проверка размера файла (не более 1MB)
        if (file.size > 1 * 1024 * 1024) {
            setFormState(prev => ({
                ...prev,
                errors: { ...prev.errors, avatar: 'Размер изображения не должен превышать 1MB' }
            }));
            return;
        }

        // Очистка ошибок, связанных с аватаром
        setFormState(prev => ({
            ...prev,
            errors: { ...prev.errors, avatar: '' }
        }));

        // Создание URL для превью изображения
        setAvatarPreview(URL.createObjectURL(file));

        // Вызов функции-обработчика изменения аватара, если она предоставлена
        if (onUserPicChange) onUserPicChange(file);
    };

    /**
     * Обработчик выбора файла через стандартный input[type="file"].
     * Передает выбранный файл на обработку.
     *
     * @param {React.ChangeEvent<HTMLInputElement>} e - Событие изменения значения поля выбора файла.
     */
    const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    /**
     * Обработчик отправки формы.
     * Валидирует данные формы и, в случае успеха, отправляет их и закрывает диалог.
     */
    const handleSubmit = () => {
        if (validateForm()) {
            // Создание объекта с обновленными данными профиля
            const data: UserProfileEdit = {
                login,
                // Включаем пароль в данные только если он был изменен
                password: password ? password : undefined,
                first_name,
                last_name,
                city,
                about_me,
                sex,
            };
            // Вызов функции отправки данных и закрытие диалога
            onSubmit(data);
            onClose();
        }
    };

    const handleCityChange = (_event: React.ChangeEvent<{}>, value: string | null) => {
        setFormState(prev => ({ ...prev, city: value || '' }));
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            {/* Заголовок диалога */}
            <DialogTitle>Редактирование профиля</DialogTitle>

            {/* Основное содержимое диалога */}
            <DialogContent>
                {/* Область загрузки аватара с поддержкой drag&drop */}
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                        border: dragActive ? '2px solid #1976d2' : '1px dashed #bdbdbd',
                        borderRadius: 2,
                        py: 3,
                        mb: 2,
                        backgroundColor: dragActive ? '#e3f2fd' : '#fafafa',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'border 0.2s, background 0.2s'
                    }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('avatar-upload-input')?.click()}
                >
                    {/* Скрытый input для выбора файла через диалог */}
                    <input
                        id="avatar-upload-input"
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        style={{ display: 'none' }}
                        onChange={handleAvatarSelect}
                    />

                    {/* Отображение превью аватара или иконки загрузки */}
                    <Box mb={1}>
                        <img
                            src={avatarPreview || "/icons/upload.svg"}
                            alt="avatar"
                            style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", marginBottom: 8 }}
                        />
                    </Box>

                    {/* Инструкции по загрузке аватара */}
                    <Typography variant="body2" sx={{ color: '#1976d2' }}>
                        Перетащите или кликните для загрузки аватара
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                        SVG, PNG, JPG (макс. 1MB)
                    </Typography>

                    {/* Отображение ошибки при загрузке аватара, если есть */}
                    {errors.avatar && (
                        <Typography variant="caption" color="error">
                            {errors.avatar}
                        </Typography>
                    )}
                </Box>

                {/* Форма редактирования профиля */}
                <Grid container spacing={2}>
                    {/* Поле "Имя" */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Имя"
                            name="first_name"
                            value={first_name}
                            onChange={handleInputChange}
                            fullWidth
                            error={!!errors.first_name}
                            helperText={errors.first_name}
                        />
                    </Grid>

                    {/* Поле "Фамилия" */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Фамилия"
                            name="last_name"
                            value={last_name}
                            onChange={handleInputChange}
                            fullWidth
                            error={!!errors.last_name}
                            helperText={errors.last_name}
                        />
                    </Grid>

                    {/* Поле "Логин" */}
                    <Grid item xs={12}>
                        <TextField
                            label="Логин"
                            name="login"
                            value={login}
                            onChange={handleInputChange}
                            fullWidth
                            error={!!errors.login}
                            helperText={errors.login}
                        />
                    </Grid>

                    {/* Поле "Пароль" */}
                    <Grid item xs={12}>
                        <TextField
                            label="Изменение пароля"
                            name="password"
                            type="password"
                            value={password}
                            onChange={handleInputChange}
                            fullWidth
                            error={!!errors.password}
                            helperText={errors.password}
                        />
                    </Grid>

                    {/* Поле "Подтверждение пароля" */}
                    <Grid item xs={12}>
                        <TextField
                            label="Подтверждение пароля"
                            name="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={handleInputChange}
                            fullWidth
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword}
                        />
                    </Grid>

                    {/* Выбор города */}
                    <Grid item xs={12}>
                        <Autocomplete
                            options={cities}
                            getOptionLabel={(option) => option}
                            value={city}
                            onChange={handleCityChange}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Город"
                                    fullWidth
                                    error={!!errors.city}
                                    helperText={errors.city}
                                />
                            )}
                        />
                    </Grid>

                    {/* Поле "О себе" */}
                    <Grid item xs={12}>
                        <TextField
                            label="О себе"
                            name="about_me"
                            value={about_me}
                            onChange={handleInputChange}
                            fullWidth
                            multiline
                            rows={3}
                            inputProps={{ maxLength: 500 }}
                            helperText={`${about_me.length}/500${errors.about_me ? ` — ${errors.about_me}` : ''}`}
                            error={!!errors.about_me}
                        />
                    </Grid>

                    {/* Выбор пола */}
                    <Grid item xs={12}>
                        <FormControl component="fieldset" error={!!errors.sex}>
                            <Typography component="legend" sx={{ mb: 1 }}>Пол</Typography>
                            <RadioGroup row name="sex" value={sex} onChange={handleRadioChange}>
                                <FormControlLabel value="female" control={<Radio />} label="Женский" />
                                <FormControlLabel value="male" control={<Radio />} label="Мужской" />
                                <FormControlLabel value="other" control={<Radio />} label="Другое" />
                            </RadioGroup>
                            {/* Отображение ошибки, если пол не выбран */}
                            {errors.sex && <FormHelperText>{errors.sex}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    {/* Отображение информации о создании и обновлении профиля */}
                    <Grid item xs={12}>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                            Дата создания - {profile.created_at}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                            Дата последнего изменения - {profile.updated_at}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            ID: {profile.key}
                        </Typography>
                    </Grid>
                </Grid>
            </DialogContent>

            {/* Кнопки действий диалога */}
            <DialogActions>
                <Button onClick={onClose} variant="contained" color="primary">
                    ОТМЕНИТЬ
                </Button>
                <Button onClick={handleSubmit} variant="contained" color="success">
                    СОХРАНИТЬ
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditUserProfileDialog;