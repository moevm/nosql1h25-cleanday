import React, { useState, useRef, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Alert,
    CircularProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

/**
 * Интерфейс для пропсов компонента ImportDialog.
 * @param {boolean} open - Определяет, открыт ли диалог.
 * @param {() => void} onClose - Функция, вызываемая при закрытии диалога.
 * @param {(file: File) => void} onImport - Функция, вызываемая при подтверждении импорта. Принимает выбранный файл.
 * @param {string} [title] - Заголовок диалога (опционально).
 */
interface ImportDialogProps {
    open: boolean;
    onClose: () => void;
    onImport: (file: File) => void;
    title?: string;
}

// Максимальный размер файла (3 МБ)
const MAX_FILE_SIZE = 3 * 1024 * 1024;

/**
 * ImportDialog: Компонент для импорта ZIP-файлов.
 * Предоставляет диалог с возможностью перетаскивания файлов или выбора через проводник.
 *
 * @param {ImportDialogProps} props - Пропсы компонента.
 * @returns {JSX.Element} - Возвращает JSX-элемент, представляющий диалоговое окно для импорта файлов.
 */
const ImportDialog: React.FC<ImportDialogProps> = ({
    open,
    onClose,
    onImport,
    title = 'Импорт',
}: ImportDialogProps): React.JSX.Element => {
    // Состояния компонента
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    // Ссылка на скрытый input для выбора файла
    const fileInputRef = useRef<HTMLInputElement>(null);

    /**
     * Функция для проверки валидности файла (тип и размер).
     * @param {File} file - Проверяемый файл.
     * @returns {boolean} - Результат проверки.
     */
    const validateFile = (file: File): boolean => {
        // Проверка типа файла
        if (!file.type.includes('application/zip') && !file.name.endsWith('.zip')) {
            setError('Можно загружать только ZIP-файлы');
            return false;
        }

        // Проверка размера файла
        if (file.size > MAX_FILE_SIZE) {
            setError(`Размер файла не должен превышать ${MAX_FILE_SIZE / (1024 * 1024)} МБ`);
            return false;
        }

        // Если все проверки пройдены
        setError(null);
        return true;
    };

    /**
     * Обработчик для выбора файла через проводник.
     * @param {React.ChangeEvent<HTMLInputElement>} event - Событие изменения input.
     */
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (validateFile(file)) {
                setSelectedFile(file);
            } else {
                setSelectedFile(null);
            }
        }
        // Сброс значения input для возможности повторного выбора того же файла
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    /**
     * Обработчик для нажатия на область выбора файла.
     */
    const handleBoxClick = () => {
        fileInputRef.current?.click();
    };

    /**
     * Обработчик для события начала перетаскивания.
     * @param {React.DragEvent<HTMLDivElement>} event - Событие перетаскивания.
     */
    const handleDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(true);
    }, []);

    /**
     * Обработчик для события окончания перетаскивания.
     * @param {React.DragEvent<HTMLDivElement>} event - Событие перетаскивания.
     */
    const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
    }, []);

    /**
     * Обработчик для события перетаскивания над областью.
     * @param {React.DragEvent<HTMLDivElement>} event - Событие перетаскивания.
     */
    const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    }, []);

    /**
     * Обработчик для события сброса файла.
     * @param {React.DragEvent<HTMLDivElement>} event - Событие перетаскивания.
     */
    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);

        const files = event.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (validateFile(file)) {
                setSelectedFile(file);
            } else {
                setSelectedFile(null);
            }
        }
    }, []);

    /**
     * Обработчик для подтверждения импорта.
     */
    const handleImport = () => {
        if (selectedFile) {
            setIsLoading(true);
            // Имитация задержки загрузки
            setTimeout(() => {
                onImport(selectedFile);
                setIsLoading(false);
                onClose();
            }, 500);
        }
    };

    /**
     * Обработчик для закрытия диалога.
     * Сбрасывает все состояния перед закрытием.
     */
    const handleClose = () => {
        setSelectedFile(null);
        setError(null);
        setIsDragging(false);
        setIsLoading(false);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            {/* Заголовок диалога */}
            <DialogTitle>{title}</DialogTitle>
            
            {/* Содержимое диалога */}
            <DialogContent>
                {/* Область перетаскивания файлов */}
                <Box
                    sx={{
                        border: `2px dashed ${isDragging ? 'primary.main' : 'grey.400'}`,
                        borderRadius: 2,
                        p: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isDragging ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        minHeight: 200,
                    }}
                    onClick={handleBoxClick}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    {isLoading ? (
                        <CircularProgress />
                    ) : selectedFile ? (
                        // Отображение выбранного файла
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <InsertDriveFileIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
                            <Typography variant="body1" gutterBottom>
                                {selectedFile.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {(selectedFile.size / 1024).toFixed(2)} КБ
                            </Typography>
                        </Box>
                    ) : (
                        // Инструкции по загрузке файла
                        <>
                            <CloudUploadIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
                            <Typography variant="body1" gutterBottom>
                                Перетащите ZIP-файл сюда или нажмите для выбора
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Максимальный размер файла: 3 МБ
                            </Typography>
                        </>
                    )}
                </Box>

                {/* Скрытый input для выбора файла */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".zip,application/zip"
                    style={{ display: 'none' }}
                />

                {/* Отображение ошибки, если есть */}
                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}
            </DialogContent>
            
            {/* Кнопки действий */}
            <DialogActions>
                <Button 
                    onClick={handleImport} 
                    color="success" 
                    variant="contained" 
                    disabled={!selectedFile || isLoading}
                >
                    {isLoading ? 'Импорт...' : 'Импортировать'}
                </Button>
                <Button onClick={handleClose} color="primary" variant="text">
                    Отмена
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ImportDialog;
