import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Grid,
    Box,
    Tooltip,
    Typography,
    IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {TimePicker} from '@mui/x-date-pickers/TimePicker';
// import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
// import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, {Dayjs} from 'dayjs';
import CleanDayTag from "../../models/User.ts";
import {Location, Cleanday} from "../../models/User.ts";

/**
 * Интерфейс для пропсов компонента EditCleandayDialog.
 * Определяет, какие данные компонент принимает от родительского элемента.
 * @param {boolean} open - Определяет, открыт ли диалог.
 * @param {() => void} onClose - Функция, вызываемая при закрытии диалога.
 * @param {(data: Cleanday) => void} onSubmit - Функция, вызываемая при сохранении отредактированного субботника. Принимает обновленные данные субботника.
 * @param {(cleandayKey: string) => void} onDelete - Функция, вызываемая при удалении субботника. Принимает ключ удаляемого субботника.
 * @param {Location[]} locations - Массив объектов `Location`, представляющих доступные локации для выбора.
 * @param {Cleanday | null} cleanday - Редактируемый субботник или null, если создаётся новый.
 */
interface EditCleandayDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: Cleanday) => void;
    locations: Location[];
    cleanday: Cleanday | null;
}

/**
 * Интерфейс для состояния формы редактирования субботника.
 * Описывает структуру данных, хранящихся в состоянии компонента.
 * @param {string} name - Название субботника.
 * @param {Dayjs | null} beginDateDay - Дата начала субботника.
 * @param {Dayjs | null} beginDateTime - Время начала субботника.
 * @param {Dayjs | null} endDateDay - Дата окончания субботника.
 * @param {Dayjs | null} endDateTime - Время окончания субботника.
 * @param {string} organization - Организация, проводящая субботник.
 * @param {number | undefined} area - Площадь уборки (в квадратных метрах).
 * @param {string} description - Описание субботника.
 * @param {CleanDayTag[]} selectedTags - Выбранные теги для субботника.
 * @param {number | undefined} recommendedCount - Рекомендуемое количество участников.
 * @param {Location | null} selectedLocation - Выбранная локация.
 * @param {string} additionalCondition - Поле для ввода нового условия участия.
 * @param {string[]} conditions - Массив условий для участия в субботнике.
 * @param {{ [key: string]: string }} errors - Объект, содержащий ошибки валидации формы. Ключ - имя поля, значение - текст ошибки.
 */
interface FormState {
    name: string;
    beginDateDay: Dayjs | null;
    beginDateTime: Dayjs | null;
    endDateDay: Dayjs | null;
    endDateTime: Dayjs | null;
    organization: string;
    area: number | undefined;
    description: string;
    selectedTags: CleanDayTag[];
    recommendedCount: number | undefined;
    selectedLocation: Location | null;
    additionalCondition: string;
    conditions: string[];
    errors: { [key: string]: string };
}

/**
 * Функция для создания начального состояния формы на основе переданного субботника.
 * Если субботник не передан, возвращает состояние для создания нового субботника.
 *
 * @param {Cleanday | null} cleanday - Существующий субботник или null.
 * @param {Location[]} locations - Массив доступных локаций.
 * @returns {FormState} - Начальное состояние формы.
 */
const getInitialFormState = (cleanday: Cleanday | null, locations: Location[]): FormState => {
    // Если субботник не передан, возвращаем пустое состояние
    if (!cleanday) {
        return {
            name: '',
            beginDateDay: null,
            beginDateTime: null,
            endDateDay: null,
            endDateTime: null,
            organization: '',
            area: undefined,
            description: '',
            selectedTags: [],
            recommendedCount: undefined,
            selectedLocation: null,
            additionalCondition: '',
            conditions: [],
            errors: {},
        };
    }

    // Преобразование дат из строк в объекты dayjs
    const begin = dayjs(cleanday.begin_date);
    const end = dayjs(cleanday.end_date);

    // Поиск локации по ключу
    const location = locations.find(loc => loc.key === cleanday.location.key) || null;

    // Возвращаем состояние, заполненное данными из переданного субботника
    return {
        name: cleanday.name,
        beginDateDay: begin.startOf('day'),
        beginDateTime: begin,
        endDateDay: end.startOf('day'),
        endDateTime: end,
        organization: cleanday.organization,
        area: cleanday.area,
        description: cleanday.description,
        selectedTags: cleanday.tags,
        recommendedCount: cleanday.recommended_count,
        selectedLocation: location,
        additionalCondition: '',
        conditions: cleanday.requirements || [],
        errors: {},
    };
};

/**
 * EditCleandayDialog: Компонент для редактирования существующего субботника.
 * Предоставляет форму для изменения информации о субботнике, сохранения изменений или удаления субботника.
 *
 * @param {EditCleandayDialogProps} props - Пропсы компонента.
 * @returns {React.JSX.Element} - Возвращает JSX-элемент, представляющий диалоговое окно для редактирования субботника.
 */
const EditCleandayDialog: React.FC<EditCleandayDialogProps> = ({
                                                                   open,
                                                                   onClose,
                                                                   onSubmit,
                                                                   locations,
                                                                   cleanday,
                                                               }: EditCleandayDialogProps): React.JSX.Element => {
    // Состояние формы, инициализируется данными из переданного субботника
    const [formState, setFormState] = React.useState<FormState>(getInitialFormState(cleanday, locations));

    /**
     * useEffect hook для обновления состояния формы при изменении данных субботника или открытии диалога.
     * Сбрасывает форму и заполняет её данными из переданного субботника.
     */
    React.useEffect(() => {
        if (open) {
            setFormState(getInitialFormState(cleanday, locations));
        }
    }, [open, cleanday, locations]);

    // Деструктуризация состояния формы для удобства доступа к полям
    const {
        name,
        beginDateDay,
        beginDateTime,
        endDateDay,
        endDateTime,
        organization,
        area,
        description,
        selectedTags,
        recommendedCount,
        selectedLocation,
        additionalCondition,
        conditions,
        errors,
    } = formState;

    /**
     * Функция для валидации формы.
     * Проверяет заполненность обязательных полей и корректность введенных данных.
     *
     * @returns {boolean} - Возвращает `true`, если форма валидна, и `false` в противном случае.
     */
    const validateForm = (): boolean => {
        // Объект для хранения ошибок валидации
        const newErrors: { [key: string]: string } = {};

        // Проверка обязательных полей и корректности данных
        if (!name) newErrors.name = 'Введите имя';
        if (!beginDateDay) newErrors.beginDateDay = 'Введите дату начала';
        if (!beginDateTime) newErrors.beginDateTime = 'Введите время начала';
        if (!endDateDay) newErrors.endDateDay = 'Введите дату конца';
        if (!endDateTime) newErrors.endDateTime = 'Введите время конца';
        if (area === undefined || area === null) newErrors.area = 'Введите площадь';
        else if (area <= 0) newErrors.area = 'Площадь должна быть больше 0';
        if (!description) newErrors.description = 'Введите описание';
        if (recommendedCount === undefined || recommendedCount === null) newErrors.recommendedCount = 'Введите количество';
        else if (recommendedCount <= 0) newErrors.recommendedCount = 'Количество должно быть больше 0';
        if (!selectedLocation) newErrors.location = 'Выберите локацию';

        // Обновление состояния с новыми ошибками
        setFormState(prev => ({...prev, errors: newErrors}));

        // Возвращаем результат валидации - форма валидна, если нет ошибок
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Обработчик отправки формы.
     * Валидирует форму и, если она валидна, создаёт обновлённый объект субботника и вызывает функцию onSubmit.
     */
    const handleSubmit = () => {
        // Проверяем наличие данных о субботнике
        if (!cleanday) return;

        // Валидация формы
        if (validateForm()) {
            // Дополнительная проверка обязательных полей
            if (!beginDateDay || !beginDateTime || !endDateDay || !endDateTime || !selectedLocation) return;

            // Создание объектов дат из данных формы
            const beginDate = new Date(
                beginDateDay.year(),
                beginDateDay.month(),
                beginDateDay.date(),
                beginDateTime.hour(),
                beginDateTime.minute(),
                beginDateTime.second()
            );

            const endDate = new Date(
                endDateDay.year(),
                endDateDay.month(),
                endDateDay.date(),
                endDateTime.hour(),
                endDateTime.minute(),
                endDateTime.second()
            );

            // Создание обновлённого объекта субботника
            const updatedCleanday: Cleanday = {
                ...cleanday,
                name,
                begin_date: beginDate.toISOString(),
                end_date: endDate.toISOString(),
                organization,
                area: area!,
                description,
                tags: selectedTags,
                recommended_count: recommendedCount!,
                location: selectedLocation,
                requirements: conditions,
                updated_at: new Date().toISOString(),
            };

            // Вызов функции отправки данных и закрытие диалога
            onSubmit(updatedCleanday);
            onClose();
        }
    };

    /**
     * Функция для добавления нового условия участия.
     * Добавляет текст из поля additionalCondition в массив conditions.
     */
    const handleAddCondition = () => {
        // Проверяем, что поле не пустое
        if (additionalCondition.trim() !== '') {
            // Обновляем состояние, добавляя новое условие и очищая поле ввода
            setFormState(prev => ({
                ...prev,
                conditions: [...prev.conditions, additionalCondition.trim()],
                additionalCondition: '',
            }));
        }
    };

    /**
     * Функция для удаления условия участия.
     * Удаляет условие из массива conditions по индексу.
     *
     * @param {number} index - Индекс удаляемого условия.
     */
    const handleDeleteCondition = (index: number) => {
        // Создание копии массива условий
        const newConditions = [...conditions];
        // Удаление условия по индексу
        newConditions.splice(index, 1);
        // Обновление состояния
        setFormState(prev => ({...prev, conditions: newConditions}));
    };

    /**
     * Обработчик нажатия клавиш в поле ввода условия.
     * При нажатии Enter добавляет новое условие.
     *
     * @param {React.KeyboardEvent<HTMLDivElement>} event - Событие нажатия клавиши.
     */
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleAddCondition();
        }
    };

    /**
     * Обработчик изменения текстовых полей формы.
     * Обновляет соответствующее поле в состоянии формы.
     *
     * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} event - Событие изменения значения поля.
     */
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = event.target;
        setFormState(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            {/* Заголовок диалога */}
            <DialogTitle>Редактирование субботника</DialogTitle>

            {/* Основное содержимое диалога */}
            <DialogContent>
                {/* Сетка для размещения элементов формы */}
                <Grid container spacing={2} mt={1}>
                    {/* Поле "Название субботника" */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Название"
                            name="name"
                            value={name}
                            onChange={handleInputChange}
                            error={!!errors.name}
                            helperText={errors.name}
                        />
                    </Grid>

                    {/* Выбор локации с кнопкой добавления новой локации */}
                    <Grid item xs={12}>
                        <FormControl sx={{width: '100%'}} error={!!errors.location}>
                            <InputLabel id="location-label">Локация</InputLabel>
                            <Box display="flex" flexDirection='row'>
                                <Select
                                    fullWidth
                                    labelId="location-label"
                                    id="location"
                                    value={selectedLocation ? selectedLocation.key : ''}
                                    label="Локация"
                                    onChange={(e) => {
                                        // Преобразование строкового значения в число и поиск соответствующей локации
                                        const selectedId = parseInt(e.target.value as string);
                                        const location = locations.find((loc) => loc.key === selectedId) || null;
                                        setFormState(prev => ({...prev, selectedLocation: location}));
                                    }}
                                >
                                    {/* Отображение списка доступных локаций */}
                                    {locations.map((location) => (
                                        <MenuItem key={location.key} value={location.key}>
                                            {location.address}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {/* Пространство-разделитель между селектором и кнопкой */}
                                <Box sx={{flexGrow: 1}}/>
                                {/* Кнопка для добавления новой локации */}
                                <IconButton edge="end" color="primary" size="large" sx={{
                                    backgroundColor: '#3C6C5F',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: '#345e51',
                                    },
                                    borderRadius: '10%'
                                }} tabIndex={-1}>
                                    <AddIcon/>
                                </IconButton>
                            </Box>
                            {/* Отображение ошибки, если локация не выбрана */}
                            {errors.location && (
                                <FormHelperText>{errors.location}</FormHelperText>
                            )}
                        </FormControl>
                    </Grid>

                    {/* Выбор даты начала субботника */}
                    <Grid item xs={12} sm={6}>
                        <DatePicker
                            label="Дата начала"
                            value={beginDateDay}
                            onChange={(newValue) => setFormState(prev => ({...prev, beginDateDay: newValue}))}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    error: !!errors.beginDateDay,
                                    helperText: errors.beginDateDay,
                                },
                            }}
                        />
                    </Grid>

                    {/* Выбор времени начала субботника */}
                    <Grid item xs={12} sm={6}>
                        <TimePicker
                            label="Время начала"
                            value={beginDateTime}
                            onChange={(newValue) => setFormState(prev => ({...prev, beginDateTime: newValue}))}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    error: !!errors.beginDateTime,
                                    helperText: errors.beginDateTime,
                                },
                            }}
                        />
                    </Grid>

                    {/* Выбор даты окончания субботника */}
                    <Grid item xs={12} sm={6}>
                        <DatePicker
                            label="Дата конца"
                            value={endDateDay}
                            onChange={(newValue) => setFormState(prev => ({...prev, endDateDay: newValue}))}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    error: !!errors.endDateDay,
                                    helperText: errors.endDateDay,
                                },
                            }}
                        />
                    </Grid>

                    {/* Выбор времени окончания субботника */}
                    <Grid item xs={12} sm={6}>
                        <TimePicker
                            label="Время конца"
                            value={endDateTime}
                            onChange={(newValue) => setFormState(prev => ({...prev, endDateTime: newValue}))}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    error: !!errors.endDateTime,
                                    helperText: errors.endDateTime,
                                },
                            }}
                        />
                    </Grid>

                    {/* Поле для указания организации (необязательное) */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Организация (необязательно)"
                            name="organization"
                            value={organization}
                            onChange={handleInputChange}
                        />
                    </Grid>

                    {/* Поле для указания площади уборки */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Площадь, м²"
                            type="number"
                            name="area"
                            value={area === undefined || area === null ? '' : area}
                            onChange={(e) => {
                                // Преобразование строкового значения в число
                                const parsedValue = parseFloat(e.target.value);
                                setFormState(prev => ({
                                    ...prev,
                                    area: isNaN(parsedValue) ? undefined : parsedValue,
                                }));
                            }}
                            error={!!errors.area}
                            helperText={errors.area}
                        />
                    </Grid>

                    {/* Поле для описания субботника */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Описание"
                            multiline
                            rows={4}
                            name="description"
                            value={description}
                            onChange={handleInputChange}
                            error={!!errors.description}
                            inputProps={{maxLength: 500}} // Ограничение на 500 символов
                            helperText={`${description.length}/500${errors.description ? ` - ${errors.description}` : ''}`}
                        />
                    </Grid>

                    {/* Выбор тегов для субботника */}
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel id="tags-label">Тэги</InputLabel>
                            <Select
                                labelId="tags-label"
                                id="tags"
                                multiple
                                value={selectedTags}
                                onChange={(e) => {
                                    setFormState(prev => ({...prev, selectedTags: e.target.value as CleanDayTag[]}));
                                }}
                                label="Тэги"
                                renderValue={(selected) => (selected as CleanDayTag[]).join(', ')}
                            >
                                {/* Отображение списка доступных тегов */}
                                {Object.values(CleanDayTag).map((tag) => (
                                    <MenuItem key={tag} value={tag}>
                                        {tag}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Поле для указания рекомендуемого числа участников */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Рекомендуемое число участников"
                            type="number"
                            name="recommendedCount"
                            value={recommendedCount === undefined || recommendedCount === null ? '' : recommendedCount}
                            onChange={(e) => {
                                // Преобразование строкового значения в число
                                const parsedValue = parseFloat(e.target.value);
                                setFormState(prev => ({
                                    ...prev,
                                    recommendedCount: isNaN(parsedValue) ? undefined : parsedValue,
                                }));
                            }}
                            error={!!errors.recommendedCount}
                            helperText={errors.recommendedCount}
                        />
                    </Grid>

                    {/* Секция условий участия */}
                    <Grid item xs={12}>
                        <Typography variant="h6" mt={2}>Условия участия:</Typography>
                        {/* Отображение добавленных условий */}
                        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1}}>
                            {conditions.map((condition, index) => (
                                <Tooltip key={index} title={`Удалить условие "${condition}"`} placement="top">
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        endIcon={<CloseIcon/>}
                                        onClick={() => handleDeleteCondition(index)}
                                        sx={{textTransform: 'none', m: 0.5}}
                                    >
                                        {condition}
                                    </Button>
                                </Tooltip>
                            ))}
                        </Box>
                        {/* Поле для добавления нового условия */}
                        <TextField
                            fullWidth
                            label="Условие"
                            name="additionalCondition"
                            value={additionalCondition}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Нажмите Enter для добавления"
                            sx={{mt: 1}}
                        />
                    </Grid>

                    {/* Отображение информации о создании и обновлении субботника */}
                    <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" sx={{mt: 2}}>
                            Дата создания - {cleanday && dayjs(cleanday.created_at).format('DD.MM.YYYY HH:mm')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Дата последнего изменения
                            - {cleanday && dayjs(cleanday.updated_at).format('DD.MM.YYYY HH:mm')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            ID: {cleanday?.key}
                        </Typography>
                    </Grid>
                </Grid>
            </DialogContent>

            {/* Кнопки действий диалога */}
            <DialogActions>
                <Button onClick={onClose} variant="contained" color="primary">Отмена</Button>
                <Button onClick={handleSubmit} variant="contained" color="success">Сохранить</Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditCleandayDialog;