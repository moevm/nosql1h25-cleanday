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
    Tooltip, IconButton,
} from '@mui/material';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {TimePicker} from '@mui/x-date-pickers/TimePicker';
// import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
// import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {Dayjs} from 'dayjs';
import {CleanDayTag, Location, CreateCleanday} from "@models/deleteMeLater.ts";
import AddIcon from "@mui/icons-material/Add";
import CreateLocationDialog from './CreateLocationDialog.tsx';


/**
 • Интерфейс для пропсов компонента CreateCleandayDialog.
 • Определяет, какие данные компонент принимает от родительского элемента.
 • @param {boolean} open - Определяет, открыт ли диалог.
 • @param {() => void} onClose - Функция, вызываемая при закрытии диалога.
 • @param {(data: CreateCleanday) => void} onSubmit - Функция, вызываемая при подтверждении создания субботника. Принимает данные формы (`CreateCleanday`).
 • @param {Location[]} locations - Массив объектов `Location`, представляющих доступные локации для выбора.
 */
interface CreateCleandayDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CreateCleanday) => void;
    locations: Location[];
}

/**
 • Интерфейс для состояния формы.
 • Описывает структуру данных, хранящихся в состоянии компонента.
 • @param {string} name - Название субботника.
 • @param {Dayjs | null} beginDateDay - Дата начала субботника.
 • @param {Dayjs | null} beginDateTime - Время начала субботника.
 • @param {Dayjs | null} endDateDay - Дата окончания субботника.
 • @param {Dayjs | null} endDateTime - Время окончания субботника.
 • @param {string} organization - Организация, проводящая субботник.
 • @param {number | undefined} area - Площадь уборки (в квадратных метрах).
 • @param {string} description - Описание субботника.
 • @param {CleanDayTag[]} selectedTags - Выбранные теги для субботника.
 • @param {number | undefined} recommendedCount - Рекомендуемое количество участников.
 • @param {Location | null} selectedLocation - Выбранная локация.
 • @param {string} additionalCondition - Дополнительное условие для субботника.
 • @param {string[]} conditions - Массив условий для субботника.
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
 * Начальное состояние формы.
 * Задаёт значения по умолчанию для всех полей формы.
 */
const defaultFormState: FormState = {
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


/**
 * CreateCleandayDialog: Компонент для создания субботника.
 * Предоставляет форму для заполнения информации о субботнике и отправки данных.
 *
 * @param {CreateCleandayDialogProps} props - Пропсы компонента, включающие состояние открытия, функции закрытия, отправки и список локаций.
 * @returns {JSX.Element} - Возвращает JSX-элемент, представляющий диалоговое окно для создания субботника.
 */
const CreateCleandayDialog: React.FC<CreateCleandayDialogProps> = ({
                                                                       open,
                                                                       onClose,
                                                                       onSubmit,
                                                                       locations,
                                                                   }: CreateCleandayDialogProps): React.JSX.Element => {
    // Состояние формы, хранит данные формы и ошибки валидации
    const [formState, setFormState] = React.useState<FormState>(defaultFormState);

    const [isLocationDialogOpen, setLocationDialogOpen] = React.useState(false); // State for location dialog
    const [localLocations, setLocalLocations] = React.useState<Location[]>(locations); // Local copy of locations

    const handleNewLocation = (newLocation: Location) => {
        setLocalLocations(prev => [...prev, newLocation]); // Update local locations list
        setFormState(prevState => ({
            ...prevState,
            selectedLocation: newLocation, // Automatically select the new location
        }));
    };

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
     * useEffect hook, который сбрасывает состояние формы при открытии диалога.
     *
     * @param {open} - Зависимость useEffect. Вызывается при изменении значения `open`.
     */
    React.useEffect(() => {
        if (open) {
            setFormState(defaultFormState);
        }
    }, [open]);

    /**
     * Функция для валидации формы.
     * Проверяет заполненность обязательных полей и корректность введенных данных.
     *
     * @returns {boolean} - Возвращает `true`, если форма валидна, и `false` в противном случае.
     */
    const validateForm = (): boolean => {
        // Объект для хранения ошибок валидации
        const newErrors: { [key: string]: string } = {};

        // Проверка обязательных полей и добавление ошибок в объект `newErrors`
        if (!name) {
            newErrors.name = 'Введите имя';
        }
        if (!beginDateDay) {
            newErrors.beginDateDay = 'Введите дату начала';
        }
        if (!beginDateTime) {
            newErrors.beginDateTime = 'Введите время начала';
        }
        if (!endDateDay) {
            newErrors.endDateDay = 'Введите дату конца';
        }
        if (!endDateTime) {
            newErrors.endDateTime = 'Введите время конца';
        }
        if (area === undefined || area === null) {
            newErrors.area = 'Введите площадь';
        } else if (area <= 0) {
            newErrors.area = 'Площадь должна быть больше 0';
        }
        if (!description) {
            newErrors.description = 'Введите описания';
        }
        if (recommendedCount === undefined || recommendedCount === null) {
            newErrors.recommendedCount = 'Введите количество';
        } else if (recommendedCount <= 0) {
            newErrors.recommendedCount = 'Количество должно быть больше 0';
        }
        if (!selectedLocation) {
            newErrors.location = 'Выберите локацию';
        }

        // Обновление состояния формы с ошибками валидации
        setFormState(prevState => ({...prevState, errors: newErrors}));
        // Возвращает true, если ошибок нет
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Функция для отправки данных формы.
     * Проверяет валидность формы, преобразует данные и вызывает функцию `onSubmit`.
     */
    const handleSubmit = () => {
        // Валидация формы
        if (validateForm()) {
            // Проверка, что все даты и время установлены
            if (!beginDateDay || !beginDateTime || !endDateDay || !endDateTime) {
                return;
            }

            // Создание объектов Date из Dayjs
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
            // Создание объекта с данными субботника
            const cleandayData: CreateCleanday = {
                name,
                beginDate,
                endDate,
                organization,
                area: area!,
                description,
                tags: selectedTags,
                recommendedCount: recommendedCount!,
            };
            // Вызов функции отправки данных
            onSubmit(cleandayData);
            // Закрытие диалога
            onClose();
        }
    };

    /**
     * Функция для добавления условия.
     * Добавляет новое условие в массив `conditions`.
     */
    const handleAddCondition = () => {
        // Проверка, что условие не пустое
        if (additionalCondition.trim() !== '') {
            // Обновление состояния формы с новым условием
            setFormState(prevState => ({
                ...prevState,
                conditions: [...conditions, additionalCondition.trim()],
                additionalCondition: '',
            }));
        }
    };

    /**
     * Функция для удаления условия.
     * Удаляет условие из массива `conditions` по индексу.
     *
     * @param {number} index - Индекс удаляемого условия.
     */
    const handleDeleteCondition = (index: number) => {
        // Создание копии массива условий
        const newConditions = [...conditions];
        // Удаление условия по индексу
        newConditions.splice(index, 1);
        // Обновление состояния формы
        setFormState(prevState => ({...prevState, conditions: newConditions}));
    };

    /**
     * Функция для обработки нажатия клавиши.
     * Добавляет условие при нажатии клавиши "Enter".
     *
     * @param {React.KeyboardEvent<HTMLDivElement>} event - Объект события клавиатуры.
     */
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        // Проверка, что нажата клавиша "Enter"
        if (event.key === 'Enter') {
            // Предотвращение отправки формы по умолчанию
            event.preventDefault();
            // Добавление условия
            handleAddCondition();
        }
    };

    /**
     * Функция для обработки изменения значения в поле ввода.
     * Обновляет состояние формы при изменении значения в поле ввода.
     *
     * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} event - Объект события изменения.
     */
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        // Получение имени и значения поля
        const {name, value} = event.target;

        // Обновление состояния формы
        setFormState(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            {/* Заголовок диалога */}
            <DialogTitle>Создание субботника</DialogTitle>
            {/* Контент диалога */}
            <DialogContent>
                {/* Сетка для размещения элементов формы */}
                <Grid container spacing={2} mt={1}>
                    {/* Поле "Название" */}
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
                                        const selectedId = parseInt(e.target.value as string);
                                        const location = locations.find((loc) => loc.key === selectedId) || null;
                                        setFormState(prev => ({...prev, selectedLocation: location}));
                                    }}
                                >
                                    {locations.map((location) => (
                                        <MenuItem key={location.key} value={location.key}>
                                            {location.address}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <Box sx={{flexGrow: 1}}/>
                                <IconButton edge="end" color="primary" size="large" sx={{
                                    backgroundColor: '#3C6C5F',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: '#345e51',
                                    },
                                    borderRadius: '10%'
                                }} tabIndex={-1}
                                onClick={() => {setLocationDialogOpen(true)}}>
                                    <AddIcon/>
                                </IconButton>
                            </Box>
                            {errors.location && (
                                <FormHelperText>{errors.location}</FormHelperText>
                            )}
                        </FormControl>
                    </Grid>

                    {/* Поля "Дата начала" и "Время начала" */}
                    <Grid item xs={12} sm={6}>
                        <DatePicker
                            label="Дата начала"
                            value={beginDateDay}
                            onChange={(newValue) => setFormState(prevState => ({
                                ...prevState,
                                beginDateDay: newValue
                            }))}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    error: !!errors.beginDateDay,
                                    helperText: errors.beginDateDay,
                                },
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TimePicker
                            label="Время начала"
                            value={beginDateTime}
                            onChange={(newValue) => setFormState(prevState => ({
                                ...prevState,
                                beginDateTime: newValue
                            }))}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    error: !!errors.beginDateTime,
                                    helperText: errors.beginDateTime,
                                },
                            }}
                        />
                    </Grid>

                    {/* Поля "Дата конца" и "Время конца" */}
                    <Grid item xs={12} sm={6}>
                        <DatePicker
                            label="Дата конца"
                            value={endDateDay}
                            onChange={(newValue) => setFormState(prevState => ({
                                ...prevState,
                                endDateDay: newValue
                            }))}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    error: !!errors.endDateDay,
                                    helperText: errors.endDateDay,
                                },
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TimePicker
                            label="Время конца"
                            value={endDateTime}
                            onChange={(newValue) => setFormState(prevState => ({
                                ...prevState,
                                endDateTime: newValue
                            }))}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    error: !!errors.endDateTime,
                                    helperText: errors.endDateTime,
                                },
                            }}
                        />
                    </Grid>

                    {/* Поле "Организация" */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Организация"
                            name="organization"
                            value={organization}
                            onChange={handleInputChange}
                        />
                    </Grid>

                    {/* Поля "Площадь" и "Рекомендуемое число участников" */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Площадь, m^2"
                            type="number"
                            name="area"
                            value={area === undefined ? '' : area.toString()}
                            onChange={(e) => {
                                const parsedValue = parseFloat(e.target.value);
                                setFormState(prevState => ({
                                    ...prevState,
                                    area: isNaN(parsedValue) ? undefined : parsedValue,
                                }));
                            }}
                            error={!!errors.area}
                            helperText={errors.area}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Рекомендуемое число участников"
                            type="number"
                            name="recommendedCount"
                            value={recommendedCount === undefined ? '' : recommendedCount.toString()}
                            onChange={(e) => {
                                const parsedValue = parseFloat(e.target.value);
                                setFormState(prevState => ({
                                    ...prevState,
                                    recommendedCount: isNaN(parsedValue) ? undefined : parsedValue,
                                }));
                            }}
                            error={!!errors.recommendedCount}
                            helperText={errors.recommendedCount}
                        />
                    </Grid>

                    {/* Поле "Описание" */}
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
                            helperText={errors.description}
                        />
                    </Grid>


                    {/* Выбор тегов */}
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel id="tags-label">Тэги</InputLabel>
                            <Select
                                labelId="tags-label"
                                id="tags"
                                multiple
                                value={selectedTags.map(tag => tag)}
                                onChange={(e) => {
                                    setFormState(prevState => ({
                                        ...prevState,
                                        selectedTags: e.target.value as CleanDayTag[]
                                    }));
                                }}
                                label="Тэги"
                                renderValue={(selected) => {
                                    return (selected as CleanDayTag[]).join(', ');
                                }}
                            >
                                {/* Отображение списка тегов */}
                                {Object.values(CleanDayTag).map((tag) => (
                                    <MenuItem key={tag} value={tag}>
                                        {tag}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Список условий */}
                    <Grid item xs={12}>
                        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                            {conditions.map((condition, index) => (
                                <Tooltip key={index} title={`Удалить условие "${condition}"`} placement="top">
                                    <Button variant="outlined" color="primary"
                                            onClick={() => handleDeleteCondition(index)}>
                                        {condition}
                                    </Button>
                                </Tooltip>
                            ))}
                        </Box>
                    </Grid>

                    {/* Добавление условия */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Добавить условие"
                            name="additionalCondition"
                            value={additionalCondition}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Нажмите Enter для добавления"
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            {/* Кнопки действий диалога */}
            <DialogActions>
                <Button onClick={onClose} variant="contained" color="primary">Отмена</Button>
                <Button onClick={handleSubmit} variant="contained" color="success">
                    Создать
                </Button>
            </DialogActions>
            {/* Location Dialog */}
            <CreateLocationDialog
                open={isLocationDialogOpen}
                onClose={() => setLocationDialogOpen(false)}
                onSubmit={(locationData) => {
                    const newLocation: Location = {
                        address: locationData.address,
                        instructions: locationData.additionalInfo,
                        key: Math.max(...localLocations.map(loc => loc.key)) + 1, // Generate new unique key
                        city: locationData.city,
                    };
                    handleNewLocation(newLocation);
                    setLocationDialogOpen(false);
                }}
            />
        </Dialog>
    );
};

export default CreateCleandayDialog;

