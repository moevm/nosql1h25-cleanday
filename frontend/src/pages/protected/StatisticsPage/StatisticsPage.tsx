import './StatisticsPage.css';

import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import Notification from '@components/Notification.tsx';

import './StatisticsPage.css';
import ExportConfirmationDialog from "@components/dialog/ExportConfirmationDialog.tsx";
import ImportDialog from "@components/dialog/ImportDialog.tsx";
import { useGetStatistics } from '@hooks/statistics/useGetStatistics.tsx';
import { useExportStatistics } from '@hooks/statistics/useExportStatistics.tsx';
import { useImportStatistics } from '@hooks/statistics/useImportStatistics.tsx';

/**
 * StatisticsPage: Компонент страницы для отображения статистики приложения.
 * Представляет общие данные о пользователях и субботниках, а также предоставляет
 * функциональность для импорта и экспорта статистических данных.
 *
 * @returns {JSX.Element} - Возвращает JSX-элемент, представляющий страницу статистики.
 */
const StatisticsPage: React.FC = (): React.JSX.Element => {
    // Получение статистических данных с сервера
    const { data: statisticData, isLoading, error } = useGetStatistics();

    // Хуки для экспорта и импорта
    const { refetch: exportData, isLoading: isExporting } = useExportStatistics();
    const { mutate: importData, isLoading: isImporting } = useImportStatistics({
        onSuccess: () => {
            setNotificationMessage('Данные успешно импортированы');
            setNotificationSeverity('success');
        },
        onError: (error) => {
            setNotificationMessage('Ошибка при импорте данных');
            setNotificationSeverity('error');
            console.error('Import error:', error);
        }
    });

    /**
     * Состояния для отображения уведомлений пользователю.
     * notificationMessage - текст уведомления, null если нет активных уведомлений.
     * notificationSeverity - тип уведомления ('success', 'info', 'warning' или 'error').
     */
    const [notificationMessage, setNotificationMessage] = React.useState<string | null>(null);
    const [notificationSeverity, setNotificationSeverity] = React.useState<'success' | 'info' | 'warning' | 'error'>('success');

    // Состояние для управления диалогом подтверждения экспорта
    const [isExportDialogOpen, setExportDialogOpen] = React.useState<boolean>(false);

    // Состояние для управления диалогом импорта
    const [isImportDialogOpen, setImportDialogOpen] = React.useState<boolean>(false);

    /**
     * Обработчик нажатия кнопки импорта.
     * Показывает диалог импорта.
     */
    const handleImportButtonClick = () => {
        setImportDialogOpen(true);
    };

    /**
     * Обработчик подтверждения импорта.
     * Отправляет файл на сервер с помощью хука useImportStatistics.
     * @param {File} file - Импортируемый файл.
     */
    const handleImportConfirm = (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        importData(formData);
    };

    /**
     * Обработчик нажатия кнопки экспорта.
     * Показывает диалог подтверждения экспорта.
     */
    const handleExportButtonClick = () => {
        setExportDialogOpen(true);
    };

    /**
     * Обработчик подтверждения экспорта.
     * Запускает экспорт с помощью хука useExportStatistics.
     */
    const handleExportConfirm = async () => {
        try {
            const { data } = await exportData();
            if (data) {
                // Создаем ссылку для скачивания файла
                const url = URL.createObjectURL(data);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'arangodump.zip';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                setNotificationMessage('Экспорт успешно выполнен');
                setNotificationSeverity('success');
            }
        } catch (error) {
            console.error('Export error:', error);
            setNotificationMessage('Ошибка при экспорте данных');
            setNotificationSeverity('error');
        }
    };

    /**
     * Обработчик закрытия уведомления.
     * Сбрасывает notificationMessage, что приводит к скрытию компонента уведомления.
     */
    const handleNotificationClose = () => {
        setNotificationMessage(null);
    };

    /**
     * Обработчик закрытия диалога подтверждения экспорта.
     */
    const handleExportDialogClose = () => {
        setExportDialogOpen(false);
    };

    /**
     * Обработчик закрытия диалога импорта.
     */
    const handleImportDialogClose = () => {
        setImportDialogOpen(false);
    };

    // Отображение загрузки
    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    // Отображение ошибки
    if (error) {
        return (
            <Box sx={{ p: 10 }}>
                <Typography variant="h4" color="error" gutterBottom>
                    Ошибка загрузки статистики
                </Typography>
                <Typography>
                    Не удалось загрузить данные статистики. Попробуйте обновить страницу.
                </Typography>
            </Box>
        );
    }

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
                    <Button 
                        variant="outlined"
                        sx={{color: 'black', borderColor: 'black'}} 
                        onClick={handleImportButtonClick}
                        disabled={isImporting}
                    >
                        {isImporting ? 'Импортирование...' : 'Импорт'}
                    </Button>
                    <Button 
                        variant="outlined"
                        sx={{color: 'black', borderColor: 'black'}} 
                        onClick={handleExportButtonClick}
                        disabled={isExporting}
                    >
                        {isExporting ? 'Экспортирование...' : 'Экспорт'}
                    </Button>
                </Box>
            </Box>

            {/* Блок отображения статистических данных */}
            <Box sx={{ mb: 2}}>
                <Typography mb={3}>Всего пользователей: {statisticData.userCount}</Typography>
                <Typography mb={3}>Пользователи, принявшие участие хотя бы в одном субботнике: {statisticData.participatedUserCount}</Typography>
                <Typography mb={3}>Всего субботников: {statisticData.cleandayCount}</Typography>
                <Typography mb={3}>Прошедших субботников: {statisticData.pastCleandayCount}</Typography>
                <Typography mb={3}>Убрано, м³: {statisticData.cleandayMetric}</Typography>
            </Box>

            {/* Блок для отображения графического представления статистики */}
            <Box mt={4} display="flex" justifyContent="center">
                <img src="/basementMenuImage.png" alt="Statistics Page" style={{ maxWidth: '100%', height: 'auto' }} />
            </Box>

            {/* Компонент уведомления */}
            {notificationMessage && (
                <Notification
                    message={notificationMessage}
                    severity={notificationSeverity}
                    onClose={handleNotificationClose}
                />
            )}

            {/* Диалог подтверждения экспорта */}
            <ExportConfirmationDialog
                open={isExportDialogOpen}
                onClose={handleExportDialogClose}
                onConfirm={handleExportConfirm}
            />

            {/* Диалог импорта */}
            <ImportDialog
                open={isImportDialogOpen}
                onClose={handleImportDialogClose}
                onImport={handleImportConfirm}
            />
        </Box>
    );
};

export default StatisticsPage;