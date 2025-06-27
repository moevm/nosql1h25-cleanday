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
    IconButton,
    Paper,
    Alert, Autocomplete,
    CircularProgress
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import { City } from "@models/City";
import { CreateLocationApiModel } from "@api/location/models";
import { useGetAllCities } from "@hooks/city/useGetAllCities";
import { useCreateLocation } from "@hooks/location/useCreateLocation";
import { useAddLocationImages } from "@hooks/location/useAddLocationImages";

// Максимальный размер файла (3 МБ)
const MAX_FILE_SIZE = 3 * 1024 * 1024;

// Допустимые типы файлов
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

/**
 • Интерфейс для пропсов компонента CreateLocationDialog
 */
interface CreateLocationDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (createdLocation: Location) => void;  // Changed from CreateLocationApiModel to Location
}

/**
 * CreateLocationDialog: Компонент для создания новой локации.
 * Предоставляет форму с полями: название, город, адрес, загрузка изображений и дополнительная информация.
 *
 * @param {CreateLocationDialogProps} props - Пропсы компонента.
 * @returns {JSX.Element} - Возвращает JSX-элемент, представляющий диалоговое окно для создания локации.
 */
const CreateLocationDialog: React.FC<CreateLocationDialogProps> = ({
    open,
    onClose,
    onSubmit,
}: CreateLocationDialogProps): React.JSX.Element => {
    // Используем хуки для создания локации и добавления изображений
    const createLocationMutation = useCreateLocation();
    const addLocationImagesMutation = useAddLocationImages();
    
    // Используем хук для получения списка городов
    const { data: cities = [], isLoading: isLoadingCities, error: citiesError } = useGetAllCities();
    
    // Состояния формы
    const [name, setName] = useState<string>('');
    const [city, setCity] = useState<City | null>(null);
    const [address, setAddress] = useState<string>('');
    const [additionalInfo, setAdditionalInfo] = useState<string>('');
    const [images, setImages] = useState<File[]>([]);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const [fileError, setFileError] = useState<string | null>(null);
    // Состояние для отслеживания процесса создания
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Ref для скрытого input загрузки файлов
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Add state for image descriptions
    const [imageDescriptions, setImageDescriptions] = useState<string[]>([]);

    /**
     * Функция для валидации формы
     * @returns {boolean} - Результат валидации
     */
    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!address.trim()) {
            newErrors.address = 'Введите адрес локации';
        }

        if (!city) {
            newErrors.city = 'Выберите город';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Функция для валидации файла
     * @param {File} file - Проверяемый файл
     * @returns {boolean} - Результат валидации
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
     * Обработчик отправки формы
     */
    const handleSubmit = async () => {
        if (validateForm()) {
            setIsSubmitting(true);
            setFileError(null);
            
            try {
                const locationData: CreateLocationApiModel = {
                    address: address.trim(),
                    instructions: additionalInfo.trim(),
                    city_key: city ? city.id : '',
                };
                
                console.log('Creating location with data:', locationData);
                
                // Сначала создаем локацию
                const createdLocation = await createLocationMutation.mutateAsync(locationData);
                
                console.log('Location created successfully:', createdLocation);
                
                // Если есть изображения и локация успешно создана, добавляем их
                if (images.length > 0 && createdLocation?.id) {
                    console.log('Adding images to location ID:', createdLocation.id);
                    try {
                        await addLocationImagesMutation.mutateAsync({
                            locationId: createdLocation.id,
                            files: images,
                            descriptions: imageDescriptions
                        });
                        console.log('Images added successfully');
                    } catch (imageError) {
                        console.error('Failed to upload images:', imageError);
                        setFileError('Локация создана, но произошла ошибка при загрузке изображений.');
                        // Continue anyway since the location was created
                    }
                }
                
                // Вызываем колбэк onSubmit с созданной локацией вместо данных формы
                onSubmit(createdLocation);
                
                // Закрываем диалог 
                handleClose();
            } catch (error) {
                console.error('Error creating location:', error);
                setFileError('Произошла ошибка при создании локации. Пожалуйста, попробуйте снова.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    /**
     * Обработчик закрытия диалога
     */
    const handleClose = () => {
        // Сброс формы
        setName('');
        setCity(null);
        setAddress('');
        setAdditionalInfo('');
        setImages([]);
        setImageDescriptions([]);
        setErrors({});
        setCurrentImageIndex(0);
        onClose();
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
                // Add empty descriptions for new images
                setImageDescriptions(prevDescriptions => [
                    ...prevDescriptions, 
                    ...validFiles.map(() => '')
                ]);
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
        
        // Also remove corresponding description
        setImageDescriptions(prevDescriptions => {
            const newDescriptions = [...prevDescriptions];
            newDescriptions.splice(index, 1);
            return newDescriptions;
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
     * Обработчик изменения описания изображения
     */
    const handleDescriptionChange = (index: number, value: string) => {
        setImageDescriptions(prevDescriptions => {
            const newDescriptions = [...prevDescriptions];
            newDescriptions[index] = value;
            return newDescriptions;
        });
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>Создание новой локации</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    {/* Название локации */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Название локации"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </Grid>

                    {/* Выбор города */}
                    <Grid item xs={12} sm={6}>
                        {isLoadingCities ? (
                            <Box display="flex" justifyContent="center" alignItems="center" height="56px">
                                <CircularProgress size={24} />
                            </Box>
                        ) : citiesError ? (
                            <Alert severity="error">Ошибка загрузки городов</Alert>
                        ) : (
                            <Autocomplete
                                options={cities}
                                getOptionLabel={(option) => option.name}
                                value={city}
                                onChange={(_event, value) => setCity(value)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Город"
                                        variant="outlined"
                                        required
                                        error={!!errors.city}
                                        helperText={errors.city}
                                    />
                                )}
                            />
                        )}
                    </Grid>

                    {/* Адрес локации */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Адрес"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            error={!!errors.address}
                            helperText={errors.address}
                            required
                        />
                    </Grid>

                    {/* Карусель изображений */}
                    <Grid item xs={12}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}
                        >
                            <Typography variant="subtitle1" gutterBottom>
                                Фотографии локации
                            </Typography>

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
                                    
                                    {/* Add description field for current image */}
                                    <TextField
                                        fullWidth
                                        label="Описание изображения"
                                        value={imageDescriptions[currentImageIndex] || ''}
                                        onChange={(e) => handleDescriptionChange(currentImageIndex, e.target.value)}
                                        placeholder="Введите описание изображения"
                                        sx={{ mb: 2 }}
                                    />

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

                    {/* Дополнительная информация */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Дополнительная информация"
                            multiline
                            rows={4}
                            value={additionalInfo}
                            onChange={(e) => setAdditionalInfo(e.target.value)}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleSubmit}
                    color="success"
                    variant="contained"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? <CircularProgress size={24} /> : 'Создать'}
                </Button>
                <Button
                    onClick={handleClose}
                    color="primary"
                    variant="text"
                    disabled={isSubmitting}
                >
                    Отмена
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateLocationDialog;
