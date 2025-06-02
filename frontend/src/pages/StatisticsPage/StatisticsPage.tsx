import './StatisticsPage.css'

import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import Notification from '../../components/Notification';

import './StatisticsPage.css'; // You can create this file for custom styling
import {StatisticData} from '../../models/User';

/**
 * StatisticsPage: Компонент страницы для отображения статистики приложения.
 * Представляет общие данные о пользователях и субботниках, а также предоставляет
 * функциональность для импорта и экспорта статистических данных.
 *
 * @returns {JSX.Element} - Возвращает JSX-элемент, представляющий страницу статистики.
 */
const StatisticsPage: React.FC = (): React.JSX.Element => {
    /**
     * Состояние для хранения статистических данных.
     * Инициализируется примерными данными для демонстрации (в реальном приложении
     * данные были бы загружены с сервера).
     */
    const [statisticData, setStatisticData] = React.useState<StatisticData>({
        totalUsers: 100,                    // Общее количество пользователей
        usersParticipatedInCleanup: 60,     // Количество пользователей, участвовавших в субботниках
        totalSubbotniks: 30,                // Общее количество субботников
        pastSubbotniks: 10,                 // Количество прошедших субботников
        areaCleaned: '100 m²',              // Площадь, которая была очищена
    });

    /**
     * Состояния для отображения уведомлений пользователю.
     * notificationMessage - текст уведомления, null если нет активных уведомлений.
     * notificationSeverity - тип уведомления ('success', 'info', 'warning' или 'error').
     */
    const [notificationMessage, setNotificationMessage] = React.useState<string | null>(null);
    const [notificationSeverity, setNotificationSeverity] = React.useState<'success' | 'info' | 'warning' | 'error'>('success');

    // TODO: Реализуйте обработку
    /**
     * Обработчик нажатия кнопки импорта.
     * В данной реализации выводит сообщение в консоль и отображает уведомление об успехе.
     * В реальном приложении запускал бы процесс импорта данных из внешнего источника.
     */
    const handleImportButtonClick = () => {
        console.log('Import button clicked');
        setNotificationMessage('Успешный импорт');
        setNotificationSeverity('success');
    };

    // TODO: Реализуйте обработку
    /**
     * Обработчик нажатия кнопки экспорта.
     * В данной реализации выводит сообщение в консоль и отображает уведомление об успехе.
     * В реальном приложении запускал бы процесс экспорта данных во внешний файл.
     */
    const handleExportButtonClick = () => {
        console.log('Export button clicked');
        setNotificationMessage('Успешный экспорт');
        setNotificationSeverity('success');
    };

    /**
     * Обработчик закрытия уведомления.
     * Сбрасывает notificationMessage, что приводит к скрытию компонента уведомления.
     */
    const handleNotificationClose = () => {
        setNotificationMessage(null);
    };

    return (
        <Box className={"statistics-box"} sx={{ p: 10 }}>
            {/* Верхняя панель с заголовком и кнопками импорта/экспорта */}
            <Box display="flex" flexDirection="row" mr={"100px"} justifyContent="space-between">
                {/* Заголовок страницы */}
                <Typography variant="h4" gutterBottom>
                    Статистика
                </Typography>

                {/* Кнопки импорта и экспорта */}
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Button variant="outlined"
                            sx={{color: 'black', borderColor: 'black'}} onClick={handleImportButtonClick}>
                        Импорт
                    </Button>
                    <Button variant="outlined"
                            sx={{color: 'black', borderColor: 'black'}} onClick={handleExportButtonClick}>
                        Экспорт
                    </Button>
                </Box>
            </Box>

            {/* Блок отображения статистических данных */}
            <Box sx={{ mb: 2}}>
                <Typography mb={3}>Всего пользователей: {statisticData.totalUsers}</Typography>
                <Typography mb={3}>Пользователи, принявшие участие хотя бы в одном субботнике: {statisticData.usersParticipatedInCleanup}</Typography>
                <Typography mb={3}>Всего субботников: {statisticData.totalSubbotniks}</Typography>
                <Typography mb={3}>Прошедших субботников: {statisticData.pastSubbotniks}</Typography>
                <Typography mb={3}>Убрано, м³: {statisticData.areaCleaned}</Typography>
            </Box>

            {/* Блок для отображения графического представления статистики */}
            <Box mt={4} display="flex" justifyContent="center">
                <img src="/img.png" alt="Statistics Page" style={{ maxWidth: '100%', height: 'auto' }} />
            </Box>

            {/* Компонент уведомления */}
            {notificationMessage && (
                <Notification
                    message={notificationMessage}
                    severity={notificationSeverity}
                    onClose={handleNotificationClose}
                />
            )}
        </Box>
    );
};

export default StatisticsPage;