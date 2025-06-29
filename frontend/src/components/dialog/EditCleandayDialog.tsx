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
    IconButton,
    CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {TimePicker} from '@mui/x-date-pickers/TimePicker';
import dayjs, {Dayjs} from 'dayjs';
import {CleandayTag, Cleanday} from "@models/Cleanday.ts";
import {Location} from "@models/Location.ts";
import CreateLocationDialog from "./CreateLocationDialog.tsx";
import {useUpdateCleandayInfo} from "@hooks/cleanday/useUpdateCleandayInfo";
import {useGetAllLocation} from "@hooks/location/useGetAllLocation";
import {useCreateLocation} from "@hooks/location/useCreateLocation";
import Notification from '@components/Notification.tsx';
import {CreateRequirementApiModel, RequirementApiModel, UpdateCleandayApiModel} from "@api/cleanday/models.ts";

/**
 * Интерфейс для пропсов компонента EditCleandayDialog.
 */
interface EditCleandayDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    cleanday: Cleanday | null;
}

/**
 * Интерфейс для состояния формы редактирования субботника.
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
    selectedTags: CleandayTag[];
    recommendedCount: number | undefined;
    selectedLocation: Location | null;
    additionalCondition: string;
    conditions: string[];
    errors: { [key: string]: string };
}

/**
 * Функция для создания начального состояния формы на основе переданного субботника.
 */
const getInitialFormState = (cleanday: Cleanday | null, locations: Location[]): FormState => {
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

    const begin = dayjs(cleanday.beginDate);
    const end = dayjs(cleanday.endDate);

    const location = locations.find(loc => loc.id === cleanday.location.id) || null;

    const requirementStrings = cleanday.requirements
        ? cleanday.requirements.map(req => req.name || req.toString())
        : [];

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
        recommendedCount: cleanday.recommendedParticipantsCount,
        selectedLocation: location,
        additionalCondition: '',
        conditions: requirementStrings,
        errors: {},
    };
};

/**
 * EditCleandayDialog: Компонент для редактирования существующего субботника.
 */
const EditCleandayDialog: React.FC<EditCleandayDialogProps> = ({
                                                                   open,
                                                                   onClose,
                                                                   onSuccess,
                                                                   cleanday,
                                                               }: EditCleandayDialogProps): React.JSX.Element => {


    // Хук для обновления данных субботника
    const {mutate: updateCleanday} = useUpdateCleandayInfo(cleanday?.id || '');

    // Хук для получения локаций
    const {
        data: locations = [],
        isLoading: isLocationsLoading,
        error: locationsError,
        refetch: refetchLocations
    } = useGetAllLocation({enabled: false});

    // Хук для создания новой локации
    const {mutateAsync: createLocation} = useCreateLocation();

    // Запускаем загрузку локаций только при открытии окна
    React.useEffect(() => {
        if (open) {
            refetchLocations();
        }
    }, [open, refetchLocations]);

    // Состояние формы
    const [formState, setFormState] = React.useState<FormState>(getInitialFormState(cleanday, locations));

    // Состояния для диалога локаций и уведомлений
    const [isLocationDialogOpen, setLocationDialogOpen] = React.useState(false);
    const [notificationMessage, setNotificationMessage] = React.useState<string | null>(null);
    const [notificationSeverity, setNotificationSeverity] = React.useState<'success' | 'info' | 'warning' | 'error'>('success');

    // Обновление формы при изменении cleanday или locations
    React.useEffect(() => {
        if (open && locations.length > 0) {
            setFormState(getInitialFormState(cleanday, locations));
        }
    }, [open, cleanday, locations]);

    // Деструктуризация состояния формы
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
     */
    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

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

        setFormState(prev => ({...prev, errors: newErrors}));
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Обработчик отправки формы.
     */
    const handleSubmit = () => {
        if (!cleanday) return;

        if (validateForm()) {
            if (!beginDateDay || !beginDateTime || !endDateDay || !endDateTime || !selectedLocation) return;

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


            // const {
            //     beginDate: beginDateFromCleanday,
            //     endDate: endDateFromCleanday,
            //     recommendedParticipantsCount: recommendedParticipantsCountFromCleanday,
            //     ...cleandayLeftovers
            // } = cleanday;


            const updatedCleanday: UpdateCleandayApiModel = {
                // ...cleanday,
                name,
                location_id: selectedLocation.id,
                begin_date: beginDate.toISOString(),
                end_date: endDate.toISOString(),
                organization,
                area: area!,
                description,
                tags: selectedTags,
                recommended_count: recommendedCount!,
                requirements: conditions as unknown as RequirementApiModel[],
            };

            // Вызываем мутацию обновления субботника
            updateCleanday(updatedCleanday, {
                onSuccess: () => {
                    setNotificationMessage('Субботник успешно обновлен');
                    setNotificationSeverity('success');
                    if (onSuccess) onSuccess();
                    onClose();
                },
                onError: () => {
                    setNotificationMessage('Ошибка при обновлении субботника');
                    setNotificationSeverity('error');
                }
            });
        }
    };

    // Остальные функции для управления формой
    const handleAddCondition = () => {
        if (additionalCondition.trim() !== '') {
            setFormState(prev => ({
                ...prev,
                conditions: [...prev.conditions, additionalCondition.trim()],
                additionalCondition: '',
            }));
        }
    };

    const handleDeleteCondition = (index: number) => {
        const newConditions = [...conditions];
        newConditions.splice(index, 1);
        setFormState(prev => ({...prev, conditions: newConditions}));
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleAddCondition();
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = event.target;
        setFormState(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleNotificationClose = React.useCallback(() => {
        setNotificationMessage(null);
    }, [setNotificationMessage]);

    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
                <DialogTitle>Редактирование субботника</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} mt={1}>
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
                                    {isLocationsLoading ? (
                                        <Box display="flex" justifyContent="center" width="100%" py={2}>
                                            <CircularProgress/>
                                        </Box>
                                    ) : locationsError ? (
                                        <Box display="flex" justifyContent="center" width="100%" color="error.main"
                                             py={2}>
                                            Ошибка загрузки локаций
                                        </Box>
                                    ) : (
                                        <Select
                                            fullWidth
                                            labelId="location-label"
                                            id="location"
                                            value={selectedLocation ? selectedLocation.id : ''}
                                            label="Локация"
                                            onChange={(e) => {
                                                const selectedId = e.target.value as string;
                                                const location = locations.find((loc) => loc.id === selectedId) || null;
                                                setFormState(prev => ({...prev, selectedLocation: location}));
                                            }}
                                        >
                                            {locations.map((location) => (
                                                <MenuItem key={location.id} value={location.id}>
                                                    {location.address}
                                                    {location.city && ` (${location.city.name})`}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    )}
                                    <Box sx={{flexGrow: 1}}/>
                                    <IconButton edge="end" color="primary" size="large" sx={{
                                        backgroundColor: '#3C6C5F',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: '#345e51',
                                        },
                                        borderRadius: '10%'
                                    }} tabIndex={-1}
                                                onClick={() => {
                                                    setLocationDialogOpen(true)
                                                }}>
                                        <AddIcon/>
                                    </IconButton>
                                </Box>
                                {errors.location && (
                                    <FormHelperText>{errors.location}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>

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

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Организация"
                                name="organization"
                                value={organization}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Площадь, м²"
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
                                            selectedTags: e.target.value as CleandayTag[]
                                        }));
                                    }}
                                    label="Тэги"
                                    renderValue={(selected) => {
                                        return (selected as CleandayTag[]).join(', ');
                                    }}
                                >
                                    {Object.values(CleandayTag).map((tag) => (
                                        <MenuItem key={tag} value={tag}>
                                            {tag}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

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

                <DialogActions>
                    <Button onClick={onClose} variant="contained" color="primary">Отмена</Button>
                    <Button onClick={handleSubmit} variant="contained" color="success">Сохранить</Button>
                </DialogActions>

                <CreateLocationDialog
                    open={isLocationDialogOpen}
                    onClose={() => setLocationDialogOpen(false)}
                    onSubmit={async (newLocation) => {
                        try {
                            // После создания локации обновляем список локаций
                            await refetchLocations();
                            
                            // Автоматически выбираем созданную локацию
                            setFormState(prev => ({
                                ...prev,
                                selectedLocation: newLocation,
                            }));
                            setLocationDialogOpen(false);
                        } catch (error) {
                            console.error('Failed to update locations:', error);
                        }
                    }}
                />
            </Dialog>

            {notificationMessage && (
                <Notification
                    message={notificationMessage}
                    severity={notificationSeverity}
                    onClose={handleNotificationClose}
                />
            )}
        </>
    );
};

export default EditCleandayDialog;