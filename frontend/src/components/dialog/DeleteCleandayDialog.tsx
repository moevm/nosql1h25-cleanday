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
 * Интерфейс для пропсов компонента DeleteCleandayDialog.
 * @param {boolean} open - Определяет, открыт ли диалог.
 * @param {() => void} onClose - Функция, вызываемая при закрытии диалога.
 * @param {() => void} onConfirm - Функция, вызываемая при подтверждении удаления.
 * @param {string} [title] - Заголовок диалога (опционально).
 * @param {string} [message] - Сообщение в диалоге (опционально).
 */
interface DeleteCleandayDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
}

/**
 * DeleteCleandayDialog: Компонент для подтверждения удаления субботника.
 * Предоставляет диалог с кнопками подтверждения/отмены.
 *
 * @param {DeleteCleandayDialogProps} props - Пропсы компонента.
 * @returns {JSX.Element} - Возвращает JSX-элемент, представляющий диалоговое окно для подтверждения удаления.
 */
const DeleteCleandayDialog: React.FC<DeleteCleandayDialogProps> = ({
    open,
    onClose,
    onConfirm,
    title = 'Подтверждение удаления субботника',
    message = 'Уверены, что хотите удалить субботник?',
}: DeleteCleandayDialogProps): React.JSX.Element => {

    /**
     * Обработчик подтверждения удаления.
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
                    Удалить
                </Button>
                <Button onClick={onClose} color="primary" variant="text">
                    Отмена
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteCleandayDialog;
