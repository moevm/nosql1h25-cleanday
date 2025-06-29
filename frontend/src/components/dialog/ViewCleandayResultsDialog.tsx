import React, { useState, useEffect } from 'react';
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
    CircularProgress,
    Alert
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { CleandayResults } from "@models/deleteMeLater.ts";
import { useGetCleandayImages } from "@hooks/cleanday/useGetCleandayImages.tsx";

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
    
    // Fetch cleanday images using the API
    const { data: imageData, isLoading, error } = useGetCleandayImages(results.id.toString());

    /**
     * Перейти к следующему изображению в карусели
     */
    const handleNextPhoto = () => {
        if (imageData?.contents?.length > 0) {
            setCurrentPhotoIndex(prev => (prev + 1) % imageData.contents.length);
        }
    };

    /**
     * Перейти к предыдущему изображению в карусели
     */
    const handlePrevPhoto = () => {
        if (imageData?.contents?.length > 0) {
            setCurrentPhotoIndex(prev => (prev - 1 + imageData.contents.length) % imageData.contents.length);
        }
    };

    // Reset the index when images are loaded or dialog opens
    useEffect(() => {
        if (open) {
            setCurrentPhotoIndex(0);
        }
    }, [open, imageData]);

    // Helper function to properly format base64 image
    const getImageSrc = (photoData: string): string => {
        // Check if the string already includes the data:image prefix
        if (photoData.startsWith('data:image')) {
            return photoData;
        }
        
        // Otherwise, add the prefix for proper base64 image display
        return `data:image/jpeg;base64,${photoData}`;
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
                        
                        {isLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                <CircularProgress />
                            </Box>
                        ) : error ? (
                            <Alert severity="error">Ошибка загрузки изображений</Alert>
                        ) : imageData?.contents && imageData.contents.length > 0 ? (
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
                                            // Use the helper function to ensure proper base64 formatting
                                            src={getImageSrc(imageData.contents[currentPhotoIndex].photo)}
                                            alt={`Фото ${currentPhotoIndex + 1}`}
                                            style={{ 
                                                maxHeight: '100%', 
                                                maxWidth: '100%', 
                                                objectFit: 'contain' 
                                            }}
                                        />
                                    </Box>
                                    
                                    {/* Display image description if available */}
                                    {imageData.contents[currentPhotoIndex].description && (
                                        <Typography variant="body2" align="center" sx={{ mb: 2 }}>
                                            {imageData.contents[currentPhotoIndex].description}
                                        </Typography>
                                    )}

                                    {/* Навигация карусели */}
                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                                        <IconButton onClick={handlePrevPhoto} disabled={imageData.contents.length <= 1}>
                                            <NavigateBeforeIcon />
                                        </IconButton>
                                        <Typography>
                                            {currentPhotoIndex + 1} / {imageData.contents.length}
                                        </Typography>
                                        <IconButton onClick={handleNextPhoto} disabled={imageData.contents.length <= 1}>
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
