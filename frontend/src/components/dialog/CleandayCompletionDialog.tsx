import React, { useState, useRef } from 'react';
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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Tooltip,
    Divider,
    Alert
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

/**
 * Интерфейс для участника субботника
 */
interface Participant {
    id: number;
    name: string;
    status: ParticipantStatus;
}

/**
 * Перечисление для статуса участника
 */
enum ParticipantStatus {
    CONFIRMED = 'Подтвержден',
    PARTICIPATED = 'Участвовал',
    NOT_PARTICIPATED = 'Не участвовал',
    UNKNOWN = 'Неизвестно'
}

/**
 * Интерфейс для данных завершения субботника
 */
interface CompletionData {
    results: string[];
    images: File[];
    participantStatuses: { [userId: number]: ParticipantStatus };
}

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

// Максимальный размер файла (3 МБ)
const MAX_FILE_SIZE = 3 * 1024 * 1024;

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
    const [participantStatuses, setParticipantStatuses] = useState<{ [userId: number]: ParticipantStatus }>(
        participants.reduce((acc, participant) => {
            acc[participant.id] = participant.status;
            return acc;
        }, {} as { [userId: number]: ParticipantStatus })
    );
    const [result, setResult] = useState<string>('');
    const [results, setResults] = useState<string[]>([]);
    const [images, setImages] = useState<File[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const [fileError, setFileError] = useState<string | null>(null);

    // Ref для скрытого input загрузки файлов
    const fileInputRef = useRef<HTMLInputElement>(null);

    /**
     * Обработчик изменения статуса участника
     */
    const handleStatusChange = (userId: number, newStatus: ParticipantStatus) => {
        setParticipantStatuses(prev => ({
            ...prev,
            [userId]: newStatus
        }));
    };

    /**
     * Обработчик добавления результата
     */
    const handleAddResult = () => {
        if (result.trim() !== '') {
            setResults(prev => [...prev, result.trim()]);
            setResult('');
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
            setFileError(`Размер файла не должен превышать 3 МБ`);
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
        const completionData: CompletionData = {
            results,
            images,
            participantStatuses
        };
        onSubmit(completionData);
        onClose();
    };

    /**
     * Получить цвет для статуса участника
     */
    const getStatusColor = (status: ParticipantStatus): "success" | "error" | "warning" | "default" => {
        switch (status) {
            case ParticipantStatus.PARTICIPATED:
                return "success";
            case ParticipantStatus.NOT_PARTICIPATED:
                return "error";
            case ParticipantStatus.CONFIRMED:
                return "warning";
            case ParticipantStatus.UNKNOWN:
            default:
                return "default";
        }
    };

    /**
     * Получить иконку для статуса участника
     */
    const getStatusIcon = (status: ParticipantStatus) => {
        switch (status) {
            case ParticipantStatus.PARTICIPATED:
                return <CheckCircleIcon fontSize="small" />;
            case ParticipantStatus.NOT_PARTICIPATED:
                return <CancelIcon fontSize="small" />;
            case ParticipantStatus.CONFIRMED:
            case ParticipantStatus.UNKNOWN:
            default:
                return <HelpOutlineIcon fontSize="small" />;
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                Завершение субботника
                <Typography variant="subtitle1" color="text.secondary">
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
                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Участник</TableCell>
                                        <TableCell>Статус</TableCell>
                                        <TableCell>Действия</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {participants.map((participant) => (
                                        <TableRow key={participant.id}>
                                            <TableCell>{participant.name}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={participantStatuses[participant.id]}
                                                    color={getStatusColor(participantStatuses[participant.id])}
                                                    icon={getStatusIcon(participantStatuses[participant.id])}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Button
                                                        size="small"
                                                        variant={participantStatuses[participant.id] === ParticipantStatus.PARTICIPATED ? "contained" : "outlined"}
                                                        color="success"
                                                        onClick={() => handleStatusChange(participant.id, ParticipantStatus.PARTICIPATED)}
                                                    >
                                                        Участвовал
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant={participantStatuses[participant.id] === ParticipantStatus.NOT_PARTICIPATED ? "contained" : "outlined"}
                                                        color="error"
                                                        onClick={() => handleStatusChange(participant.id, ParticipantStatus.NOT_PARTICIPATED)}
                                                    >
                                                        Не участвовал
                                                    </Button>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
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
                <Button onClick={onClose} color="primary" variant="text">
                    Отмена
                </Button>
                <Button 
                    onClick={handleSubmit} 
                    color="success" 
                    variant="contained"
                >
                    Завершить субботник
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CleandayCompletionDialog;
