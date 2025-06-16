import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Chip,
    IconButton,
    Paper,
    Divider,
    Grid,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {CleandayResults} from "@models/deleteMeLater.ts";



/**
 * Интерфейс для пропсов компонента ViewCleandayResultsDialog
 */
interface ViewCleandayResultsDialogProps {
    open: boolean;
    onClose: () => void;
    results: CleandayResults;
}

/**
 * ViewCleandayResultsDialog: Компонент для просмотра результатов завершенного субботника.
 * Отображает список достижений и фотографии с мероприятия.
 *
 * @param {ViewCleandayResultsDialogProps} props - Пропсы компонента.
 * @returns {JSX.Element} - Возвращает JSX-элемент, представляющий диалоговое окно для просмотра результатов субботника.
 */
const ViewCleandayResultsDialog: React.FC<ViewCleandayResultsDialogProps> = ({
    open,
    onClose,
    results,
}: ViewCleandayResultsDialogProps): React.JSX.Element => {
    // Состояние для отслеживания текущего индекса фото в карусели
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);

    /**
     * Перейти к следующему изображению в карусели
     */
    const handleNextPhoto = () => {
        if (results.photos.length > 0) {
            setCurrentPhotoIndex(prev => (prev + 1) % results.photos.length);
        }
    };

    /**
     * Перейти к предыдущему изображению в карусели
     */
    const handlePrevPhoto = () => {
        if (results.photos.length > 0) {
            setCurrentPhotoIndex(prev => (prev - 1 + results.photos.length) % results.photos.length);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                Результаты субботника
                <Typography component="div" variant="subtitle1" color="text.secondary">
                    {results.name}
                </Typography>
            </DialogTitle>

            <DialogContent>
                <Grid container spacing={3}>
                    {/* Информация о субботнике */}
                    <Grid item xs={12}>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body1">
                                <strong>Дата проведения:</strong> {results.date}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Место проведения:</strong> {results.location}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Количество участников:</strong> {results.participantsCount}
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Divider />
                    </Grid>

                    {/* Результаты субботника */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Достижения
                        </Typography>
                        
                        {results.results.length > 0 ? (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                {results.results.map((result, index) => (
                                    <Chip
                                        key={index}
                                        label={result}
                                        color="primary"
                                        icon={<CheckCircleIcon />}
                                    />
                                ))}
                            </Box>
                        ) : (
                            <Typography color="text.secondary">
                                Нет данных о результатах
                            </Typography>
                        )}
                    </Grid>

                    <Grid item xs={12}>
                        <Divider />
                    </Grid>

                    {/* Фотографии с субботника */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Фотографии
                        </Typography>
                        
                        {results.photos.length > 0 ? (
                            <Paper variant="outlined" sx={{ p: 2 }}>
                                {/* Карусель фотографий */}
                                <Box sx={{ width: '100%', position: 'relative' }}>
                                    {/* Текущее изображение */}
                                    <Box 
                                        sx={{ 
                                            height: 400, 
                                            display: 'flex', 
                                            justifyContent: 'center', 
                                            alignItems: 'center',
                                            mb: 2
                                        }}
                                    >
                                        <img
                                            src={results.photos[currentPhotoIndex]}
                                            alt={`Фото ${currentPhotoIndex + 1}`}
                                            style={{ 
                                                maxHeight: '100%', 
                                                maxWidth: '100%', 
                                                objectFit: 'contain' 
                                            }}
                                        />
                                    </Box>

                                    {/* Навигация карусели */}
                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                                        <IconButton onClick={handlePrevPhoto} disabled={results.photos.length <= 1}>
                                            <NavigateBeforeIcon />
                                        </IconButton>
                                        <Typography>
                                            {currentPhotoIndex + 1} / {results.photos.length}
                                        </Typography>
                                        <IconButton onClick={handleNextPhoto} disabled={results.photos.length <= 1}>
                                            <NavigateNextIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </Paper>
                        ) : (
                            <Typography color="text.secondary">
                                Нет фотографий
                            </Typography>
                        )}
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color="primary" variant="contained">
                    Закрыть
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ViewCleandayResultsDialog;
