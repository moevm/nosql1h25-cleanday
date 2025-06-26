import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    CircularProgress,
} from '@mui/material';
import { useUpdateCleandayInfo } from '@hooks/cleanday/useUpdateCleandayInfo';
import { CleandayStatus } from '@models/Cleanday';

/**
 * Интерфейс для пропсов компонента CancelCleandayDialog.
 * @param {boolean} open - Определяет, открыт ли диалог.
 * @param {() => void} onClose - Функция, вызываемая при закрытии диалога.
 * @param {() => void} onConfirm - Функция, вызываемая при успешном подтверждении отмены.
 * @param {string} cleandayId - ID субботника, который нужно отменить.
 * @param {string} [title] - Заголовок диалога (опционально).
 * @param {string} [message] - Сообщение в диалоге (опционально).
 */
interface CancelCleandayDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    cleandayId: string;
    title?: string;
    message?: string;
}

/**
 * CancelCleandayDialog: Компонент для подтверждения отмены субботника.
 * При подтверждении меняет статус субботника на "Отменен" через API.
 *
 * @param {CancelCleandayDialogProps} props - Пропсы компонента.
 * @returns {JSX.Element} - Возвращает JSX-элемент, представляющий диалоговое окно для подтверждения отмены.
 */
const CancelCleandayDialog: React.FC<CancelCleandayDialogProps> = ({
                                                                       open,
                                                                       onClose,
                                                                       onConfirm,
                                                                       cleandayId,
                                                                       title = 'Подтверждение отмены субботника',
                                                                       message = 'Уверены, что хотите отменить субботник?',
                                                                   }: CancelCleandayDialogProps): React.JSX.Element => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { mutateAsync: updateCleanday } = useUpdateCleandayInfo(cleandayId);

    /**
     * Обработчик подтверждения отмены.
     * Отправляет запрос на обновление статуса субботника и вызывает колбэк onConfirm при успехе.
     */
    const handleConfirm = async () => {
        try {
            setIsSubmitting(true);

            // Обновляем только статус субботника, включаем пустой массив для requirements
            await updateCleanday({
                status: CleandayStatus.cancelled,
                requirements: [] // Добавляем обязательное поле requirements с пустым массивом
            });

            // Вызываем колбэк при успешной отмене
            onConfirm();
            onClose();
        } catch (error) {
            console.error('Error cancelling cleanday:', error);
        } finally {
            setIsSubmitting(false);
        }
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
                <Button
                    onClick={handleConfirm}
                    color="error"
                    variant="contained"
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                >
                    {isSubmitting ? 'Отмена субботника...' : 'Подтвердить'}
                </Button>
                <Button onClick={onClose} color="primary" variant="text" disabled={isSubmitting}>
                    Отмена
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CancelCleandayDialog;