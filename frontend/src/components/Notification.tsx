import * as React from 'react';
import {
    Snackbar,
    Alert,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export type NotificationSeverity = 'success' | 'info' | 'warning' | 'error';

/**
 * Интерфейс для пропсов компонента Notification.
 * Определяет, какие данные компонент принимает от родительского элемента.
 * @param {string} message - Текст уведомления.
 * @param {'success' | 'info' | 'warning' | 'error'} severity - Тип уведомления (успех, информация, предупреждение, ошибка), по умолчанию 'success'.
 * @param {number} duration - Продолжительность отображения уведомления в миллисекундах, по умолчанию 3000 (3 секунды).
 * @param {() => void} onClose - Функция, вызываемая после закрытия уведомления (по таймеру или по клику).
 */
interface NotificationProps {
    message: string;
    severity?: NotificationSeverity;
    duration?: number;
    onClose?: () => void;
}

/**
 * Notification: Компонент для отображения уведомлений (toast).
 * Отображает Snackbar с Alert, позволяя показывать информационные сообщения пользователю.
 *
 * @param {NotificationProps} props - Пропсы компонента, включающие сообщение, тип, длительность и функцию закрытия.
 * @returns {JSX.Element | null} - Возвращает JSX-элемент, представляющий уведомление, или null, если сообщение отсутствует.
 */
const Notification: React.FC<NotificationProps> = ({
                                                       message,
                                                       severity = 'success',
                                                       duration = 3000,
                                                       onClose
                                                   }: NotificationProps): React.JSX.Element | null => {
    const [open, setOpen] = React.useState(false); // Состояние, определяющее, отображается ли уведомление
    const alertRef = React.useRef<HTMLDivElement>(null); // Ссылка на элемент Alert (используется для фокусировки)

    // useEffect хук для управления отображением и закрытием уведомления
    React.useEffect(() => {
        if (message) {
            setOpen(true); // Открываем уведомление

            const timer = setTimeout(() => { // Устанавливаем таймер для автоматического закрытия
                setOpen(false); // Закрываем уведомление по истечении времени
                if (onClose) {
                    onClose(); // Вызываем обработчик onClose после закрытия
                }
            }, duration);

            if (open && alertRef.current) {
                alertRef.current.focus(); // Устанавливаем фокус на Alert (для доступности)
            }

            return () => clearTimeout(timer); // Очистки таймера
        } else {
            setOpen(false); // Закрываем уведомление
        }
    }, [message, duration, open, onClose]); // Зависимости useEffect (изменение которых вызывает его повторное выполнение)

    // Функция для обработки закрытия уведомления (по клику на крестик или вне области уведомления)
    const handleClose = (_event: React.SyntheticEvent<any, Event> | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return; // Ничего не делаем (предотвращаем закрытие по клику вне области)
        }

        setOpen(false); // Закрываем уведомление
        if (onClose) {
            onClose(); // Вызываем обработчик onClose после закрытия
        }
    };

    // Если сообщение пустое, не рендерим ничего
    if (!message) {
        return null;
    }

    // Создаем кнопку "Закрыть"
    const action = (
        <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleClose} // При клике на кнопку "Закрыть" вызываем handleClose
        >
            <CloseIcon fontSize="small"/> // Иконка "Закрыть"
        </IconButton>
    );

    // Рендерим компонент Snackbar (контейнер уведомления)
    return (
        <Snackbar
            open={open}
            autoHideDuration={6000}
            onClose={handleClose}
            anchorOrigin={{vertical: 'bottom', horizontal: 'right'}} // Положение Snackbar (внизу слева)
            action={action} // Кнопка "Закрыть"
        >
            <Alert
                ref={alertRef} // Привязываем ссылку к Alert
                tabIndex={-1} // Делаем Alert фокусируемым (для доступности)
                onClose={handleClose}
                severity={severity} // Тип уведомления
                sx={{width: '100%'}} // Задаем ширину Alert
            >
                {message}
            </Alert>
        </Snackbar>
    );
};

export default Notification; // Экспортируем компонент Notification
