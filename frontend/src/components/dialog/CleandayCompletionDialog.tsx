import React, {useState, useRef, useMemo, useEffect} from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    Box,
    Typography,
    Paper,
    Chip,
    IconButton,
    Tooltip,
    Divider,
    Alert,
    Checkbox,
    CircularProgress,
    Snackbar,
} from '@mui/material';
import {MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef} from 'material-react-table';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import {CompletionData, Participant, ParticipantStatus, ParticipationStatus} from '@models/deleteMeLater.ts';
import {useMutation} from '@tanstack/react-query';
import axiosInstance from '@/axiosInstance.ts';
import substituteIdToEndpoint from '@/utils/api/substituteIdToEndpoint.ts';
import {END_CLEANDAY} from '@api/cleanday/endpoints.ts';
import {useGetCleandayMembers} from "@hooks/cleanday/useGetCleandayMembers.tsx";  // Moved import to top level

/**
 * Интерфейс для пропсов компонента CleandayCompletionDialog
 */
interface CleandayCompletionDialogProps {
    open: boolean;
    onClose: () => void;
    cleandayId: string;
    onSubmit: (completionData: CompletionData) => void;
    cleandayName: string;
    organizer?: string; // Add this prop
}

interface ImageWithDescription {
    file: File;
    description: string;
}

// Максимальный размер файла (1 МБ)
const MAX_FILE_SIZE = 1 * 1024 * 1024;

// Допустимые типы файлов
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

/**
 * CleandayCompletionDialog: Компонент для завершения субботника.
 * Предоставляет форму для отметки участников, добавления результатов и загрузки фотографий.
 *
 * @param {CleandayCompletionDialogProps} props - Пропсы компонента.
 * @returns {JSX.Element} - Возвращает JSX-элемент, представляющий диалоговое окно для завершения субботника.
 */
const CleandayCompletionDialog: React.FC<CleandayCompletionDialogProps> = ({
    open,
    onClose,
    cleandayId,
    onSubmit,
    cleandayName,
    organizer, // Add this to the destructured props
}: CleandayCompletionDialogProps): React.JSX.Element => {
    // Параметры для получения участников
    const membersParams = {
        page: 0,
        size: 100,
        sort: 'firstName,asc' // Сортировка участников по имени
    };

    // Получаем список участников через API
    const {
        data: membersData,
        isLoading: isMembersLoading,
        error: membersError
    } = useGetCleandayMembers(cleandayId, membersParams);

    // Получаем участников из ответа API
    const participants = useMemo(() => membersData?.contents || [], [membersData]);

    // Состояния
    const [participantStatuses, setParticipantStatuses] = useState<{ [userId: number]: ParticipationStatus }>({});
    const [convertedStatuses, setConvertedStatuses] = useState<{ [userId: number]: ParticipantStatus }>({});
    const [result, setResult] = useState<string>('');
    const [results, setResults] = useState<string[]>([]);
    const [images, setImages] = useState<ImageWithDescription[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const [fileError, setFileError] = useState<string | null>(null);
    const [hasChanges, setHasChanges] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [notification, setNotification] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error';
    }>({open: false, message: '', severity: 'success'});

    // Ref для скрытого input загрузки файлов
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize participant statuses when participants data is loaded
    useEffect(() => {
        if (participants.length > 0) {
            const initialParticipantStatuses = participants.reduce((acc, participant) => {
                // Check if this participant is the organizer
                const isOrganizer = participant.login === organizer;

                if (isOrganizer) {
                    acc[participant.id] = ParticipationStatus.GOING;
                    return acc;
                }

                // For non-organizers, proceed as before
                let status: ParticipationStatus;
                switch (participant.status) {
                    case ParticipantStatus.PARTICIPATED:
                        status = ParticipationStatus.GOING;
                        break;
                    case ParticipantStatus.NOT_PARTICIPATED:
                        status = ParticipationStatus.NOT_GOING;
                        break;
                    case ParticipantStatus.CONFIRMED:
                        status = ParticipationStatus.MAYBE;
                        break;
                    default:
                        // Changed default to GOING instead of NOT_GOING
                        status = ParticipationStatus.GOING;
                }
                acc[participant.id] = status;
                return acc;
            }, {} as { [userId: number]: ParticipationStatus });

            const initialConvertedStatuses = participants.reduce((acc, participant) => {
                const isOrganizer = participant.login === organizer;
                if (isOrganizer) {
                    acc[participant.id] = ParticipantStatus.PARTICIPATED;
                } else {
                    acc[participant.id] = participant.status;
                }
                return acc;
            }, {} as { [userId: number]: ParticipantStatus });

            setParticipantStatuses(initialParticipantStatuses);
            setConvertedStatuses(initialConvertedStatuses);
        }
    }, [participants, organizer]);


    // Initialize participant statuses when participants data is loaded
    useEffect(() => {
        if (participants.length > 0) {
            const initialParticipantStatuses = participants.reduce((acc, participant) => {
                // Check if this participant is the organizer
                const isOrganizer = participant.login === organizer;

                if (isOrganizer) {
                    acc[participant.id] = ParticipationStatus.GOING;
                    return acc;
                }

                // For non-organizers, proceed as before
                let status: ParticipationStatus;
                switch (participant.status) {
                    case ParticipantStatus.PARTICIPATED:
                        status = ParticipationStatus.GOING;
                        break;
                    case ParticipantStatus.NOT_PARTICIPATED:
                        status = ParticipationStatus.NOT_GOING;
                        break;
                    case ParticipantStatus.CONFIRMED:
                        status = ParticipationStatus.MAYBE;
                        break;
                    default:
                        // Changed default to GOING instead of NOT_GOING
                        status = ParticipationStatus.GOING;
                }
                acc[participant.id] = status;
                return acc;
            }, {} as { [userId: number]: ParticipationStatus });

            // Similarly update the converted statuses
            const initialConvertedStatuses = participants.reduce((acc, participant) => {
                const isOrganizer = participant.login === organizer;
                if (isOrganizer) {
                    acc[participant.id] = ParticipantStatus.PARTICIPATED;
                } else {
                    acc[participant.id] = participant.status;
                }
                return acc;
            }, {} as { [userId: number]: ParticipantStatus });

            setParticipantStatuses(initialParticipantStatuses);
            setConvertedStatuses(initialConvertedStatuses);
        }
    }, [participants, organizer]);

    // Reset state when dialog opens/closes
    useEffect(() => {
        if (open) {
            setHasChanges(false);
        }
    }, [open]);

    /**
     * Обработчик изменения статуса участника
     */
    const handleStatusChange = (userId: number, newStatus: ParticipationStatus) => {
        setParticipantStatuses(prev => ({
            ...prev,
            [userId]: newStatus
        }));
        setHasChanges(true);
    };

    /**
     * Обработчик изменения фактического присутствия участника
     */
    const handleAttendanceChange = (userId: number, attended: boolean) => {
        const newConvertedStatuses = {...convertedStatuses};
        newConvertedStatuses[userId] = attended
            ? ParticipantStatus.PARTICIPATED
            : ParticipantStatus.NOT_PARTICIPATED;
        setConvertedStatuses(newConvertedStatuses);
        setHasChanges(true);
    };

    /**
     * Обработчик добавления результата
     */
    const handleAddResult = () => {
        if (result.trim() !== '') {
            setResults(prev => [...prev, result.trim()]);
            setResult('');
            setHasChanges(true);
        }
    };

    /**
     * Обработчик удаления результата
     */
    const handleDeleteResult = (index: number) => {
        setResults(prev => prev.filter((_, i) => i !== index));
    };

    /**
     * Обработчик нажатия клавиши при добавлении результата
     */
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleAddResult();
        }
    };

    /**
     * Функция для валидации файла
     */
    const validateFile = (file: File): boolean => {
        // Проверка типа файла
        if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
            setFileError('Поддерживаются только форматы PNG, JPG и JPEG');
            return false;
        }

        // Проверка размера файла
        if (file.size > MAX_FILE_SIZE) {
            setFileError(`Размер файла не должен превышать 1 МБ`);
            return false;
        }

        setFileError(null);
        return true;
    };

    /**
     * Обработчик клика на кнопку добавления изображения
     */
    const handleAddImageClick = () => {
        fileInputRef.current?.click();
    };

    /**
     * Обработчик выбора файлов изображений
     */
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = event.target.files;
        setFileError(null);

        if (fileList && fileList.length > 0) {
            const validFiles: ImageWithDescription[] = [];

            // Проверяем каждый файл
            for (let i = 0; i < fileList.length; i++) {
                const file = fileList[i];
                if (validateFile(file)) {
                    // Add with empty description
                    validFiles.push({file, description: ''});
                } else {
                    // При первой ошибке прекращаем обработку
                    break;
                }
            }

            // Добавляем только валидные файлы
            if (validFiles.length > 0) {
                setImages(prevImages => [...prevImages, ...validFiles]);
            }
        }

        // Сброс значения input для возможности повторного выбора тех же файлов
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        if (fileList && fileList.length > 0) {
            setHasChanges(true);
        }
    };

    /**
     * Обработчик удаления изображения
     */
    const handleDeleteImage = (index: number) => {
        setImages(prevImages => {
            const newImages = [...prevImages];
            newImages.splice(index, 1);
            return newImages;
        });

        // Корректировка индекса текущего изображения
        if (currentImageIndex >= images.length - 1) {
            setCurrentImageIndex(Math.max(0, images.length - 2));
        }

        setHasChanges(true);
    };

    /**
     * Перейти к следующему изображению в карусели
     */
    const handleNextImage = () => {
        if (images.length > 0) {
            setCurrentImageIndex(prev => (prev + 1) % images.length);
        }
    };

    /**
     * Перейти к предыдущему изображению в карусели
     */
    const handlePrevImage = () => {
        if (images.length > 0) {
            setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);
        }
    };

    /**
     * Обработчик изменения описания изображения
     */
    const handleDescriptionChange = (index: number, description: string) => {
        setImages(prevImages => {
            const newImages = [...prevImages];
            if (newImages[index]) {
                newImages[index].description = description;
            }
            return newImages;
        });

        setHasChanges(true);
    };

    // Create mutation for submitting the cleanday completion
    const endCleandayMutation = useMutation({
        mutationFn: async (completionData: any) => {
            return axiosInstance.post(
                substituteIdToEndpoint(cleandayId, END_CLEANDAY),
                completionData
            );
        },
        onSuccess: () => {
            setNotification({
                open: true,
                message: 'Субботник успешно завершен',
                severity: 'success'
            });
            onClose();
            // Refresh cleanday data if needed
        },
        onError: (error) => {
            console.error('Error completing cleanday:', error);
            setNotification({
                open: true,
                message: 'Ошибка при завершении субботника',
                severity: 'error'
            });
        }
    });

    /**
     * Converts File to Base64 string
     */
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    // Remove the prefix (e.g., "data:image/jpeg;base64,")
                    const base64 = reader.result.split(',')[1];
                    resolve(base64);
                } else {
                    reject(new Error('Failed to convert file to base64'));
                }
            };
            reader.onerror = error => reject(error);
        });
    };

    /**
     * Обработчик отправки формы
     */
    const handleSubmit = async () => {
        setIsSubmitting(true);

        try {
            // Convert images to base64 format for API
            const imagePromises = images.map(async (img) => {
                const base64Photo = await fileToBase64(img.file);
                return {
                    photo: base64Photo,
                    description: img.description || "" // Ensure description is never undefined
                };
            });

            const imageData = await Promise.all(imagePromises);

            // Get user IDs with confirmed participation
            const participatedUserKeys = Object.entries(convertedStatuses)
                .filter(([_, status]) => status === ParticipantStatus.PARTICIPATED)
                .map(([userId]) => userId);

            // Submit to end cleanday endpoint
            const cleandayResults = {
                participated_user_keys: participatedUserKeys,
                results: results,
                images: imageData
            };

            // Use the mutation to submit the data
            await endCleandayMutation.mutateAsync(cleandayResults);
        } catch (error) {
            // Error handling is done in the mutation
            console.error('Error preparing completion data:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * Получить цвет для статуса участника
     */
    const getStatusColor = (status: ParticipationStatus): "success" | "error" | "warning" | "info" | "default" => {
        switch (status) {
            case ParticipationStatus.GOING:
                return "success";
            case ParticipationStatus.LATE:
                return "info";
            case ParticipationStatus.MAYBE:
                return "warning";
            case ParticipationStatus.NOT_GOING:
                return "error";
            default:
                return "default";
        }
    };

    /**
     * Получить иконку для статуса участника
     */
    const getStatusIcon = (status: ParticipationStatus) => {
        switch (status) {
            case ParticipationStatus.GOING:
                return <CheckCircleIcon fontSize="small"/>;
            case ParticipationStatus.LATE:
                return <AccessTimeIcon fontSize="small"/>;
            case ParticipationStatus.MAYBE:
                return <HourglassEmptyIcon fontSize="small"/>;
            case ParticipationStatus.NOT_GOING:
                return <CancelIcon fontSize="small"/>;
            default:
                return <HelpOutlineIcon fontSize="small"/>;
        }
    };

    /**
     * Определение столбцов для таблицы участников
     */
    const columns = useMemo<MRT_ColumnDef<any>[]>
    (
        () => [
            {
                id: 'firstName',
                header: 'Имя',
                accessorKey: 'firstName',
                size: 120,
            },
            {
                id: 'lastName',
                header: 'Фамилия',
                accessorKey: 'lastName',
                size: 120,
            },
            {
                id: 'login',
                header: 'Логин',
                accessorKey: 'login',
                size: 150,
            },
            {
                id: 'planned_status',
                header: 'Заявленный статус',
                Cell: ({row}) => (
                    <Chip
                        label={participantStatuses[row.original.id]}
                        color={getStatusColor(participantStatuses[row.original.id])}
                        icon={getStatusIcon(participantStatuses[row.original.id])}
                        size="small"
                    />
                ),
                size: 180,
            },
            {
                id: 'actual_participation',
                header: 'Присутствовал',
                Cell: ({row}) => (
                    <Box sx={{display: 'flex', justifyContent: 'center'}}>
                        <Checkbox
                            checked={
                                convertedStatuses[row.original.id] === ParticipantStatus.PARTICIPATED
                            }
                            onChange={(e) => handleAttendanceChange(row.original.id, e.target.checked)}
                            color="success"
                            aria-label={`Отметить присутствие ${row.original.firstName} ${row.original.lastName}`}
                        />
                    </Box>
                ),
                size: 120,
            },
        ],
        [participantStatuses, convertedStatuses]
    );

    /**
     * Конфигурация таблицы MaterialReactTable с включенным встроенным поиском
     */
    const table = useMaterialReactTable({
        columns,
        data: participants,
        enableColumnOrdering: false,
        enableRowSelection: false,
        enableSorting: true,
        enableColumnFilters: true,
        positionGlobalFilter: 'left',
        enableGlobalFilter: true, // Enable built-in search
        enableColumnFilterModes: true,
        initialState: {
            density: "compact",
            pagination: {pageIndex: 0, pageSize: 10},
            showGlobalFilter: true, // Show search bar by default
        },
        muiTablePaperProps: {
            elevation: 0,
            sx: {
                border: '1px solid rgba(224, 224, 224, 1)',
                borderRadius: '4px',
            },
        },
        // Configure the search input appearance
        muiSearchTextFieldProps: {
            placeholder: 'Поиск участников',
            size: 'small',
            sx: {mb: 2},
            variant: 'outlined',
        },
        state: {
            isLoading: isMembersLoading,
        },
    });

    /**
     * Обработчик закрытия с проверкой несохраненных изменений
     */
    const handleClose = () => {
        if (hasChanges) {
            if (window.confirm('У вас есть несохраненные изменения. Вы уверены, что хотите закрыть?')) {
                onClose();
            }
        } else {
            onClose();
        }
    };

    // Show loading state or error if needed
    let participantsContent;
    if (isMembersLoading) {
        participantsContent = (
            <Box sx={{display: 'flex', justifyContent: 'center', m: 3}}>
                <CircularProgress/>
            </Box>
        );
    } else if (membersError) {
        participantsContent = (
            <Alert severity="error" sx={{m: 2}}>
                Ошибка при загрузке списка участников
            </Alert>
        );
    } else {
        participantsContent = (
            <>
                <MaterialReactTable table={table}/>

                {participants.length === 0 && (
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        p: 4
                    }}>
                        <Typography color="text.secondary">
                            Нет зарегистрированных участников
                        </Typography>
                    </Box>
                )}

                <Box sx={{mt: 2, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2}}>
                    <Typography variant="body2">
                        Всего участников: <b>{participants.length}</b>
                    </Typography>
                    <Typography variant="body2">
                        Точно идут: <b>{participants.filter(p => p.status === ParticipationStatus.GOING).length}</b>
                    </Typography>
                    <Typography variant="body2">
                        Опоздают: <b>{participants.filter(p => p.status === ParticipationStatus.LATE).length}</b>
                    </Typography>
                    <Typography variant="body2">
                        Возможно
                        придут: <b>{participants.filter(p => p.status === ParticipationStatus.MAYBE).length}</b>
                    </Typography>
                </Box>
            </>
        );
    }

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            aria-labelledby="cleanday-completion-dialog-title"
        >
            <DialogTitle id="cleanday-completion-dialog-title">
                Завершение субботника
                <Typography component="div" variant="subtitle1" color="text.secondary">
                    {cleandayName}
                </Typography>
            </DialogTitle>

            <DialogContent>
                <Grid container spacing={3}>
                    {/* Таблица участников */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Учёт участников
                        </Typography>

                        {participantsContent}
                    </Grid>

                    <Grid item xs={12}>
                        <Divider/>
                    </Grid>

                    {/* Результаты субботника */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Результаты субботника
                        </Typography>

                        {/* Список добавленных результатов */}
                        {results.length > 0 && (
                            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2}}>
                                {results.map((resultItem, index) => (
                                    <Tooltip key={index} title="Удалить результат" placement="top">
                                        <Chip
                                            label={resultItem}
                                            onDelete={() => handleDeleteResult(index)}
                                            color="primary"
                                        />
                                    </Tooltip>
                                ))}
                            </Box>
                        )}

                        {/* Поле для добавления результатов */}
                        <TextField
                            fullWidth
                            label="Добавить результат"
                            value={result}
                            onChange={(e) => setResult(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Например: 'Собрано 10 мешков мусора', 'Очищена территория 500 м²' и т.д."
                            helperText="Нажмите Enter для добавления"
                            sx={{mb: 2}}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Divider/>
                    </Grid>

                    {/* Загрузка изображений */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Фотографии с субботника
                        </Typography>

                        <Paper variant="outlined" sx={{p: 2}}>
                            {images.length > 0 ? (
                                <Box sx={{width: '100%', position: 'relative'}}>
                                    {/* Current image display */}
                                    <Box
                                        sx={{
                                            height: 300,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            mb: 2
                                        }}
                                    >
                                        <img
                                            src={URL.createObjectURL(images[currentImageIndex].file)}
                                            alt={`Изображение ${currentImageIndex + 1}`}
                                            style={{
                                                maxHeight: '100%',
                                                maxWidth: '100%',
                                                objectFit: 'contain'
                                            }}
                                        />
                                    </Box>

                                    {/* Description field for current image */}
                                    <TextField
                                        fullWidth
                                        label="Описание изображения"
                                        value={images[currentImageIndex].description}
                                        onChange={(e) => handleDescriptionChange(currentImageIndex, e.target.value)}
                                        placeholder="Введите описание изображения"
                                        sx={{mb: 2}}
                                    />

                                    {/* Carousel navigation */}
                                    <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2}}>
                                        <IconButton onClick={handlePrevImage} disabled={images.length <= 1}>
                                            <NavigateBeforeIcon/>
                                        </IconButton>
                                        <Typography>
                                            {currentImageIndex + 1} / {images.length}
                                        </Typography>
                                        <IconButton onClick={handleNextImage} disabled={images.length <= 1}>
                                            <NavigateNextIcon/>
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDeleteImage(currentImageIndex)}
                                        >
                                            <DeleteIcon/>
                                        </IconButton>
                                    </Box>
                                </Box>
                            ) : (
                                <Box
                                    sx={{
                                        height: 150,
                                        width: '100%',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        border: '2px dashed grey.300',
                                        borderRadius: 1,
                                        mb: 2
                                    }}
                                >
                                    <Typography color="text.secondary">
                                        Нет загруженных изображений
                                    </Typography>
                                </Box>
                            )}

                            {/* Image upload button */}
                            <Button
                                variant="outlined"
                                startIcon={<AddPhotoAlternateIcon/>}
                                onClick={handleAddImageClick}
                            >
                                Добавить фото (PNG, JPG, до 1 МБ)
                            </Button>
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,image/jpeg,image/jpg,image/png"
                                multiple
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                style={{display: 'none'}}
                            />

                            {/* Error display */}
                            {fileError && (
                                <Alert severity="error" sx={{mt: 2, width: '100%'}}>
                                    {fileError}
                                </Alert>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} color="inherit">
                    Отмена
                </Button>
                <Button
                    onClick={handleSubmit}
                    color="primary"
                    variant="contained"
                    disabled={isSubmitting || isMembersLoading}
                >
                    {isSubmitting ? (
                        <>
                            <CircularProgress size={24} color="inherit" sx={{mr: 1}}/>
                            Отправка...
                        </>
                    ) : (
                        'Завершить субботник'
                    )}
                </Button>
            </DialogActions>

            {/* Add notification snackbar */}
            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={() => setNotification(prev => ({...prev, open: false}))}
            >
                <Alert
                    severity={notification.severity}
                    onClose={() => setNotification(prev => ({...prev, open: false}))}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Dialog>
    );
};

export default CleandayCompletionDialog;
