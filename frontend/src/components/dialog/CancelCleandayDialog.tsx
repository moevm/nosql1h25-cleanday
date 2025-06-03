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
 * Интерфейс для пропсов компонента CancelCleandayDialog.
 * @param {boolean} open - Определяет, открыт ли диалог.
 * @param {() => void} onClose - Функция, вызываемая при закрытии диалога.
 * @param {() => void} onConfirm - Функция, вызываемая при подтверждении отмены.
 * @param {string} [title] - Заголовок диалога (опционально).
 * @param {string} [message] - Сообщение в диалоге (опционально).
 */
interface CancelCleandayDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
}

/**
 * CancelCleandayDialog: Компонент для подтверждения отмены субботника.
 * Предоставляет диалог с кнопками подтверждения/отмены.
 *
 * @param {CancelCleandayDialogProps} props - Пропсы компонента.
 * @returns {JSX.Element} - Возвращает JSX-элемент, представляющий диалоговое окно для подтверждения отмены.
 */
const CancelCleandayDialog: React.FC<CancelCleandayDialogProps> = ({
    open,
    onClose,
    onConfirm,
    title = 'Подтверждение отмены субботника',
    message = 'Уверены, что хотите отменить субботник?',
}: CancelCleandayDialogProps): React.JSX.Element => {

    /**
     * Обработчик подтверждения отмены.
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
                <Button onClick={handleConfirm} color="error" variant="contained">
                    Подтвердить
                </Button>
                <Button onClick={onClose} color="primary" variant="text">
                    Отмена
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CancelCleandayDialog;
