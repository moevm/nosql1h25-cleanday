import React, { useState, useRef, useMemo, useEffect } from 'react';
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
    InputAdornment
} from '@mui/material';
import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import SearchIcon from '@mui/icons-material/Search';
import {CompletionData, Participant, ParticipantStatus, ParticipationStatus} from '../../models/User';

/**
 * Интерфейс для пропсов компонента CleandayCompletionDialog
 */
interface CleandayCompletionDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CompletionData) => void;
    cleandayName: string;
    participants: Participant[];
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
    onSubmit,
    cleandayName,
    participants,
}: CleandayCompletionDialogProps): React.JSX.Element => {
    // Состояния
    const [participantStatuses, setParticipantStatuses] = useState<{ [userId: number]: ParticipationStatus }>(
        participants.reduce((acc, participant) => {
            // Map ParticipantStatus to ParticipationStatus for initial state
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
                    status = ParticipationStatus.NOT_GOING;
            }
            acc[participant.id] = status;
            return acc;
        }, {} as { [userId: number]: ParticipationStatus })
    );
    const [result, setResult] = useState<string>('');
    const [results, setResults] = useState<string[]>([]);
    const [images, setImages] = useState<File[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const [fileError, setFileError] = useState<string | null>(null);
    const [convertedStatuses, setConvertedStatuses] = useState<{ [userId: number]: ParticipantStatus }>(
        participants.reduce((acc, participant) => {
            // Default to the current participant status
            acc[participant.id] = participant.status;
            return acc;
        }, {} as { [userId: number]: ParticipantStatus })
    );
    // Track if form has unsaved changes
    const [hasChanges, setHasChanges] = useState<boolean>(false);
    // Add state for search text
    const [searchText, setSearchText] = useState<string>('');

    // Ref для скрытого input загрузки файлов
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        const newConvertedStatuses = { ...convertedStatuses };
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
            const validFiles: File[] = [];
            
            // Проверяем каждый файл
            for (let i = 0; i < fileList.length; i++) {
                const file = fileList[i];
                if (validateFile(file)) {
                    validFiles.push(file);
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

        if (validFiles.length > 0) {
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
     * Обработчик отправки формы
     */
    const handleSubmit = () => {
        // No need to convert statuses here anymore, as we're tracking them directly
        const completionData: CompletionData = {
            results,
            images,
            participantStatuses: convertedStatuses
        };
        onSubmit(completionData);
        onClose();
    };
    
    // Move search handling and filtered participants before the table configuration
    /**
     * Обработчик изменения текста в поле поиска
     */
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value);
    };

    // Filter participants based on search text
    const filteredParticipants = useMemo(() => {
        if (!searchText) {
            return participants;
        }
        const lowerCaseSearchText = searchText.toLowerCase();
        return participants.filter((participant) =>
            participant.name.toLowerCase().includes(lowerCaseSearchText) ||
            participant.username.toLowerCase().includes(lowerCaseSearchText)
        );
    }, [participants, searchText]);

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
                return <CheckCircleIcon fontSize="small" />;
            case ParticipationStatus.LATE:
                return <AccessTimeIcon fontSize="small" />;
            case ParticipationStatus.MAYBE:
                return <HourglassEmptyIcon fontSize="small" />;
            case ParticipationStatus.NOT_GOING:
                return <CancelIcon fontSize="small" />;
            default:
                return <HelpOutlineIcon fontSize="small" />;
        }
    };

    /**
     * Определение столбцов для таблицы участников
     */
    const columns = useMemo<MRT_ColumnDef<Participant>[]>
    (
        () => [
            {
                id: 'name',
                header: 'Имя и фамилия',
                accessorFn: (row) => row.name,
                Cell: ({ row }) => <span>{row.original.name}</span>,
            },
            {
                accessorKey: 'username',
                header: 'Имя пользователя',
                size: 150,
            },
            {
                id: 'planned_status',
                header: 'Заявленный статус',
                Cell: ({ row }) => (
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
                Cell: ({ row }) => (
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Checkbox
                            checked={
                                convertedStatuses[row.original.id] === ParticipantStatus.PARTICIPATED
                            }
                            onChange={(e) => handleAttendanceChange(row.original.id, e.target.checked)}
                            color="success"
                            aria-label={`Отметить присутствие ${row.original.name}`}
                        />
                    </Box>
                ),
                size: 120,
            },
        ],
        [participantStatuses, convertedStatuses]
    );

    /**
     * Конфигурация таблицы MaterialReactTable
     */
    const table = useMaterialReactTable({
        columns,
        data: filteredParticipants,
        enableColumnOrdering: false,
        enableRowSelection: false,
        enableSorting: true,
        enableColumnFilters: true,
        enableGlobalFilter: false,
        initialState: {
            density: "compact",
            pagination: { pageIndex: 0, pageSize: 10 },
        },
        muiTablePaperProps: {
            elevation: 0,
            sx: {
                border: '1px solid rgba(224, 224, 224, 1)',
                borderRadius: '4px',
            },
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
                        
                        {/* Add search bar above the table */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <TextField
                                label="Поиск участников"
                                value={searchText}
                                onChange={handleSearchChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                size="small"
                                sx={{ mr: 2 }}
                            />
                        </Box>
                        
                        <MaterialReactTable table={table} />
                    </Grid>

                    <Grid item xs={12}>
                        <Divider />
                    </Grid>

                    {/* Результаты субботника */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Результаты субботника
                        </Typography>
                        
                        {/* Список добавленных результатов */}
                        {results.length > 0 && (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
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
                            sx={{ mb: 2 }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Divider />
                    </Grid>

                    {/* Загрузка изображений */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Фотографии с субботника
                        </Typography>
                        
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            {images.length > 0 ? (
                                <Box sx={{ width: '100%', position: 'relative' }}>
                                    {/* Текущее изображение */}
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
                                            src={URL.createObjectURL(images[currentImageIndex])}
                                            alt={`Изображение ${currentImageIndex + 1}`}
                                            style={{ 
                                                maxHeight: '100%', 
                                                maxWidth: '100%', 
                                                objectFit: 'contain' 
                                            }}
                                        />
                                    </Box>

                                    {/* Навигация карусели */}
                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                                        <IconButton onClick={handlePrevImage} disabled={images.length <= 1}>
                                            <NavigateBeforeIcon />
                                        </IconButton>
                                        <Typography>
                                            {currentImageIndex + 1} / {images.length}
                                        </Typography>
                                        <IconButton onClick={handleNextImage} disabled={images.length <= 1}>
                                            <NavigateNextIcon />
                                        </IconButton>
                                        <IconButton 
                                            color="error" 
                                            onClick={() => handleDeleteImage(currentImageIndex)}
                                        >
                                            <DeleteIcon />
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

                            {/* Кнопка загрузки новых изображений */}
                            <Button
                                variant="outlined"
                                startIcon={<AddPhotoAlternateIcon />}
                                onClick={handleAddImageClick}
                            >
                                Добавить фото (PNG, JPG, до 3 МБ)
                            </Button>
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,image/jpeg,image/jpg,image/png"
                                multiple
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            
                            {/* Отображение ошибки файла */}
                            {fileError && (
                                <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                                    {fileError}
                                </Alert>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} color="primary" variant="text">
                    Отмена
                </Button>
                <Button 
                    onClick={handleSubmit} 
                    color="success" 
                    variant="contained"
                    disabled={!hasChanges}
                >
                    Завершить субботник
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CleandayCompletionDialog;
