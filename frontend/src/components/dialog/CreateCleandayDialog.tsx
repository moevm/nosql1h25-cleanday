import React, { useState, useEffect } from 'react';
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
    Autocomplete,
    AutocompleteRenderInputParams,
    Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';

export type CreateCleanday = {
    name: string;
    beginDate: Date;
    endDate: Date;
    organization?: string;
    area: number;
    description: string;
    tags: number[];
    recommendedCount: number;
};

export type Location = {
    address: string;
    instructions: string;
    id: number; // Added an ID for location
};


interface CreateCleandayDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CreateCleanday) => void;
    locations: Location[];
    tags: { id: number; name: string }[];
}

const CreateCleandayDialog: React.FC<CreateCleandayDialogProps> = ({
                                                                       open,
                                                                       onClose,
                                                                       onSubmit,
                                                                       locations,
                                                                       tags,
                                                                   }) => {
    const [name, setName] = useState<string>('');
    const [beginDateDay, setBeginDateDay] = useState<Dayjs | null>(null);
    const [beginDateTime, setBeginDateTime] = useState<Dayjs | null>(null);
    const [endDateDay, setEndDateDay] = useState<Dayjs | null>(null);
    const [endDateTime, setEndDateTime] = useState<Dayjs | null>(null);
    const [organization, setOrganization] = useState<string>('');
    const [area, setArea] = useState<number | undefined>(undefined); // Changed to undefined to allow empty initial value
    const [description, setDescription] = useState<string>('');
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [recommendedCount, setRecommendedCount] = useState<number | undefined>(undefined); // Changed to undefined to allow empty initial value
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        // Reset the form when the dialog opens
        if (open) {
            setName('');
            setBeginDateDay(null);
            setBeginDateTime(null);
            setEndDateDay(null);
            setEndDateTime(null);
            setOrganization('');
            setArea(undefined);
            setDescription('');
            setSelectedTags([]);
            setRecommendedCount(undefined);
            setSelectedLocation(null);
            setErrors({});
        }
    }, [open]);



    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!name) {
            newErrors.name = 'Name is required';
        }
        if (!beginDateDay) {
            newErrors.beginDateDay = 'Start Date is required';
        }
        if (!beginDateTime) {
            newErrors.beginDateTime = 'Start Time is required';
        }
        if (!endDateDay) {
            newErrors.endDateDay = 'End Date is required';
        }
        if (!endDateTime) {
            newErrors.endDateTime = 'End Time is required';
        }
        if (area === undefined || area === null) {
            newErrors.area = 'Area is required';
        } else if (area <= 0) {
            newErrors.area = 'Area must be greater than zero';
        }


        if (!description) {
            newErrors.description = 'Description is required';
        }
        if (recommendedCount === undefined || recommendedCount === null) {
            newErrors.recommendedCount = 'Recommended Count is required';
        } else if (recommendedCount <= 0) {
            newErrors.recommendedCount = 'Recommended Count must be greater than zero';
        }

        if (!selectedLocation) {
            newErrors.location = 'Location is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSubmit = () => {
        if (validateForm()) {

            if (!beginDateDay || !beginDateTime || !endDateDay || !endDateTime) {
                return; // Validation should prevent this, but add a check just in case
            }

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

            const cleandayData: CreateCleanday = {
                name,
                beginDate,
                endDate,
                organization,
                area: area!,  // validated before
                description,
                tags: selectedTags,
                recommendedCount: recommendedCount!, // validated before
            };
            onSubmit(cleandayData);
            onClose(); // Close the dialog after successful submission
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Создание субботника</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} mt={1}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Название"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            error={!!errors.name}
                            helperText={errors.name}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Дата начала"
                                value={beginDateDay}
                                onChange={(newValue) => setBeginDateDay(newValue)}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        error: !!errors.beginDateDay,
                                        helperText: errors.beginDateDay,
                                    },
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <TimePicker
                                label="Время начала"
                                value={beginDateTime}
                                onChange={(newValue) => setBeginDateTime(newValue)}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        error: !!errors.beginDateTime,
                                        helperText: errors.beginDateTime,
                                    },
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Дата конца"
                                value={endDateDay}
                                onChange={(newValue) => setEndDateDay(newValue)}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        error: !!errors.endDateDay,
                                        helperText: errors.endDateDay,
                                    },
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <TimePicker
                                label="Время конца"
                                value={endDateTime}
                                onChange={(newValue) => setEndDateTime(newValue)}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        error: !!errors.endDateTime,
                                        helperText: errors.endDateTime,
                                    },
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Организация"
                            value={organization}
                            onChange={(e) => setOrganization(e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Площадь, m^2"
                            type="number"
                            value={area === undefined ? '' : area.toString()}
                            onChange={(e) => {
                                const parsedValue = parseFloat(e.target.value);
                                setArea(isNaN(parsedValue) ? undefined : parsedValue);
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
                            value={recommendedCount === undefined ? '' : recommendedCount.toString()}
                            onChange={(e) => {
                                const parsedValue = parseFloat(e.target.value);
                                setRecommendedCount(isNaN(parsedValue) ? undefined : parsedValue);
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
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            error={!!errors.description}
                            helperText={errors.description}
                        />
                    </Grid>


                    <Grid item xs={12}>
                        <FormControl fullWidth error={!!errors.location}>
                            <InputLabel id="location-label">Локация</InputLabel>
                            <Select
                                labelId="location-label"
                                id="location"
                                value={selectedLocation ? selectedLocation.id : ''} // Use location ID as value
                                label="Локация"
                                onChange={(e) => {
                                    const selectedId = parseInt(e.target.value as string); // Parse selected value to number
                                    const location = locations.find((loc) => loc.id === selectedId) || null; // Find the Location object
                                    setSelectedLocation(location);
                                }}
                            >
                                {locations.map((location) => (
                                    <MenuItem key={location.id} value={location.id}>
                                        {location.address}
                                    </MenuItem>
                                ))}
                                {errors.location && (
                                    <FormHelperText>{errors.location}</FormHelperText>
                                )}
                            </Select>
                        </FormControl>
                    </Grid>


                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel id="tags-label">Тэги</InputLabel>
                            <Select
                                labelId="tags-label"
                                id="tags"
                                multiple
                                value={selectedTags}
                                onChange={(e) => setSelectedTags(e.target.value as number[])}
                                label="Тэги"
                                renderValue={(selected) => {
                                    const selectedTagNames = selected.map(
                                        (tagId) => tags.find((tag) => tag.id === tagId)?.name
                                    );
                                    return selectedTagNames.join(', ');
                                }}
                            >
                                {tags.map((tag) => (
                                    <MenuItem key={tag.id} value={tag.id}>
                                        {tag.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Закрыть</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    Создать
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateCleandayDialog;


