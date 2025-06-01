import React, { useState, useRef } from 'react';
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
    Grid,
    Box,
    Typography,
    IconButton,
    Paper,
    Alert,
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';

// Список городов для выпадающего списка
const CITIES = [
    'Москва',
    'Санкт-Петербург',
    'Новосибирск',
    'Екатеринбург',
    'Казань',
    'Нижний Новгород',
    'Челябинск',
    'Самара',
    'Омск',
    'Ростов-на-Дону',
    'Уфа',
    'Красноярск',
    'Воронеж',
    'Пермь',
    'Волгоград'
];

// Максимальный размер файла (3 МБ)
const MAX_FILE_SIZE = 3 * 1024 * 1024;

// Допустимые типы файлов
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

/**
 * Интерфейс для создаваемой локации
 */
interface CreateLocationData {
    name: string;
    city: string;
    address: string;
    images: File[];
    additionalInfo: string;
}

/**
 * Интерфейс для пропсов компонента CreateLocationDialog
 */
interface CreateLocationDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CreateLocationData) => void;
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
    // Состояния формы
    const [name, setName] = useState<string>('');
    const [city, setCity] = useState<string>('');
    const [address, setAddress] = useState<string>('');
    const [additionalInfo, setAdditionalInfo] = useState<string>('');
    const [images, setImages] = useState<File[]>([]);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const [fileError, setFileError] = useState<string | null>(null);

    // Ref для скрытого input загрузки файлов
    const fileInputRef = useRef<HTMLInputElement>(null);

    /**
     * Функция для валидации формы
     * @returns {boolean} - Результат валидации
     */
    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!name.trim()) {
            newErrors.name = 'Введите название локации';
        }

        if (!city) {
            newErrors.city = 'Выберите город';
        }

        if (!address.trim()) {
            newErrors.address = 'Введите адрес локации';
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
    const handleSubmit = () => {
        if (validateForm()) {
            const locationData: CreateLocationData = {
                name: name.trim(),
                city,
                address: address.trim(),
                images,
                additionalInfo: additionalInfo.trim(),
            };
            onSubmit(locationData);
            handleClose();
        }
    };

    /**
     * Обработчик закрытия диалога
     */
    const handleClose = () => {
        // Сброс формы
        setName('');
        setCity('');
        setAddress('');
        setAdditionalInfo('');
        setImages([]);
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
                            error={!!errors.name}
                            helperText={errors.name}
                        />
                    </Grid>

                    {/* Выбор города */}
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={!!errors.city}>
                            <InputLabel id="city-label">Город</InputLabel>
                            <Select
                                labelId="city-label"
                                id="city"
                                value={city}
                                label="Город"
                                onChange={(e) => setCity(e.target.value)}
                            >
                                {CITIES.map((cityName) => (
                                    <MenuItem key={cityName} value={cityName}>
                                        {cityName}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.city && (
                                <Typography color="error" variant="caption">
                                    {errors.city}
                                </Typography>
                            )}
                        </FormControl>
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
                >
                    Создать
                </Button>
                <Button 
                    onClick={handleClose} 
                    color="primary" 
                    variant="text"
                >
                    Отмена
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateLocationDialog;
