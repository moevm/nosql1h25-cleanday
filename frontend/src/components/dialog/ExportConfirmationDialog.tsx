import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
} from '@mui/material';

/**
 * Интерфейс для пропсов компонента ExportConfirmationDialog.
 * @param {boolean} open - Определяет, открыт ли диалог.
 * @param {() => void} onClose - Функция, вызываемая при закрытии диалога.
 * @param {() => void} onConfirm - Функция, вызываемая при подтверждении экспорта.
 * @param {string} [title] - Заголовок диалога (опционально).
 * @param {string} [message] - Сообщение в диалоге (опционально).
 */
interface ExportConfirmationDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
}

/**
 * ExportConfirmationDialog: Компонент для подтверждения экспорта данных.
 * Предоставляет диалог с кнопками подтверждения/отмены.
 *
 * @param {ExportConfirmationDialogProps} props - Пропсы компонента.
 * @returns {JSX.Element} - Возвращает JSX-элемент, представляющий диалоговое окно для подтверждения экспорта.
 */
const ExportConfirmationDialog: React.FC<ExportConfirmationDialogProps> = ({
    open,
    onClose,
    onConfirm,
    title = 'Подтверждение экспорта',
    message = 'Вы уверены, что хотите экспортировать данные?',
}: ExportConfirmationDialogProps): React.JSX.Element => {

    /**
     * Обработчик подтверждения экспорта.
     * Вызывает функцию onConfirm и закрывает диалог.
     */
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            {/* Заголовок диалога */}
            <DialogTitle>{title}</DialogTitle>
            
            {/* Содержимое диалога */}
            <DialogContent>
                <DialogContentText>
                    {message}
                </DialogContentText>
            </DialogContent>
            
            {/* Кнопки действий */}
            <DialogActions>
                <Button onClick={handleConfirm} color="success" variant="contained">
                    Экспорт
                </Button>
                <Button onClick={onClose} color="primary" variant="text">
                    Отмена
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ExportConfirmationDialog;
