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
 * Интерфейс для пропсов компонента LogoutConfirmationDialog.
 * @param {boolean} open - Определяет, открыт ли диалог.
 * @param {() => void} onClose - Функция, вызываемая при закрытии диалога.
 * @param {() => void} onConfirm - Функция, вызываемая при подтверждении выхода.
 * @param {string} [title] - Заголовок диалога (опционально).
 * @param {string} [message] - Сообщение в диалоге (опционально).
 */
interface LogoutConfirmationDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
}

/**
 * LogoutConfirmationDialog: Компонент для подтверждения выхода из системы.
 * Предоставляет диалог с кнопками подтверждения/отмены.
 *
 * @param {LogoutConfirmationDialogProps} props - Пропсы компонента.
 * @returns {JSX.Element} - Возвращает JSX-элемент, представляющий диалоговое окно для подтверждения выхода.
 */
const LogoutConfirmationDialog: React.FC<LogoutConfirmationDialogProps> = ({
    open,
    onClose,
    onConfirm,
    title = 'Подтверждение выхода из аккаунта',
    message = 'Уверены, что хотите выйти из аккаунта?',
}: LogoutConfirmationDialogProps): React.JSX.Element => {

    /**
     * Обработчик подтверждения выхода.
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
                    Выйти
                </Button>
                <Button onClick={onClose} color="primary" variant="text">
                    Отмена
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default LogoutConfirmationDialog;
