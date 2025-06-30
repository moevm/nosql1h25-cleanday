import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    FormControlLabel,
    Checkbox,
    Paper,
    Grid,
    Divider,
    CircularProgress,
    Alert,
    Skeleton,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import {ParticipationData, ParticipationStatus, Requirement} from "@models/deleteMeLater.ts";
import { useJoinCleanday, prepareJoinCleandayRequest } from '@hooks/cleanday/useJoinCleanday';
import { useUpdateParticipation, prepareUpdateParticipationRequest } from '@hooks/cleanday/useUpdateParticipation';
import { useGetCleandayRequirements } from '@hooks/cleanday/useGetCleandayRequirements';

/**
 * Интерфейс для пропсов компонента ParticipationDialog
 */
interface ParticipationDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: ParticipationData) => void;
    requirements?: Requirement[]; // Сделаем необязательным, так как теперь данные будут приходить от API
    initialStatus?: ParticipationStatus;
    initialRequirements?: number[];
    cleandayName: string;
    cleandayId: string | number;
    isAlreadyParticipating?: boolean;
}

/**
 * ParticipationDialog: Компонент для изменения статуса участия в субботнике.
 * Предоставляет выбор статуса и требований, которые пользователь может выполнить.
 *
 * @param {ParticipationDialogProps} props - Пропсы компонента.
 * @returns {JSX.Element} - Возвращает JSX-элемент, представляющий диалоговое окно для изменения участия.
 */
const ParticipationDialog: React.FC<ParticipationDialogProps> = ({
    open,
    onClose,
    onSubmit,
    requirements: propRequirements = [], // Для совместимости с существующим кодом
    initialStatus = ParticipationStatus.GOING,
    initialRequirements = [],
    cleandayName,
    cleandayId,
    isAlreadyParticipating = false,
}: ParticipationDialogProps): React.JSX.Element => {
    // Состояния
    const [status, setStatus] = useState<ParticipationStatus>(initialStatus);
    const [selectedRequirements, setSelectedRequirements] = useState<number[]>(initialRequirements);
    const [error, setError] = useState<string | null>(null);
    
    // Получаем требования к участию в субботнике из API
    const { 
        data: requirementsData, 
        isLoading: isLoadingRequirements,
        error: requirementsError 
    } = useGetCleandayRequirements(cleandayId, {
        page: 0,
        size: 100,
    });
    
    // Комбинируем требования из API и из пропсов (если есть)
    const requirements = requirementsData?.contents?.length ? requirementsData.contents : propRequirements;
    
    // Используем хуки для присоединения и обновления участия
    const { mutateAsync: joinCleanday, isLoading: isJoining } = useJoinCleanday(cleandayId);
    const { mutateAsync: updateParticipation, isLoading: isUpdating } = useUpdateParticipation(cleandayId);
    
    // Общий флаг загрузки
    const isLoading = isJoining || isUpdating;

    // Сброс состояний при открытии диалога с новыми начальными значениями
    useEffect(() => {
        if (open) {
            setStatus(initialStatus);
            setSelectedRequirements(initialRequirements);
            setError(null);
        }
    }, [open, initialStatus, initialRequirements]);

    /**
     * Обработчик изменения статуса участия
     * @param {ParticipationStatus} newStatus - Новый статус участия
     */
    const handleStatusChange = (newStatus: ParticipationStatus) => {
        setStatus(newStatus);
    };

    /**
     * Обработчик изменения выбранных требований
     * @param {number} requirementId - ID требования
     * @param {boolean} checked - Выбрано или нет
     */
    const handleRequirementChange = (requirementId: number, checked: boolean) => {
        if (checked) {
            setSelectedRequirements(prev => [...prev, requirementId]);
        } else {
            setSelectedRequirements(prev => prev.filter(id => id !== requirementId));
        }
    };

    /**
     * Обработчик отправки формы с вызовом API
     */
    const handleSubmit = async () => {
        try {
            setError(null);

            if (isAlreadyParticipating) {
                // Если пользователь уже участвует, обновляем его участие
                const requestData = prepareUpdateParticipationRequest(status, selectedRequirements);
                await updateParticipation(requestData);
            } else {
                // Если пользователь еще не участвует, добавляем его как участника
                const requestData = prepareJoinCleandayRequest(status, selectedRequirements);
                await joinCleanday(requestData);
            }
            
            // После успешного API-запроса вызываем onSubmit для обновления UI
            onSubmit({
                status,
                selectedRequirements,
            });
            
            onClose();
        } catch (error) {
            console.error('Error updating participation:', error);
            setError('Произошла ошибка при обновлении участия. Пожалуйста, попробуйте снова.');
        }
    };

    /**
     * Получение цвета для кнопки статуса
     * @param {ParticipationStatus} buttonStatus - Статус кнопки
     * @returns {string} - Цвет кнопки
     */
    const getStatusButtonColor = (buttonStatus: ParticipationStatus): "primary" | "success" | "error" | "warning" => {
        switch (buttonStatus) {
            case ParticipationStatus.GOING:
                return "success";
            case ParticipationStatus.NOT_GOING:
                return "error";
            case ParticipationStatus.MAYBE:
                return "warning";
            case ParticipationStatus.LATE:
                return "primary";
            default:
                return "primary";
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {isAlreadyParticipating ? 'Изменение участия в субботнике' : 'Участие в субботнике'}
                <Typography component="div" variant="subtitle1" color="text.secondary">
                    {cleandayName}
                </Typography>
            </DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                
                {requirementsError && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Не удалось загрузить требования к участию
                    </Alert>
                )}
                
                {/* Requirements section */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Подтвердите соответствие требованиям:
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        {isLoadingRequirements ? (
                            // Показываем скелетон при загрузке требований
                            <>
                                <Skeleton variant="rectangular" height={40} sx={{ mb: 1 }} />
                                <Skeleton variant="rectangular" height={40} sx={{ mb: 1 }} />
                                <Skeleton variant="rectangular" height={40} />
                            </>
                        ) : requirements.length > 0 ? (
                            // Показываем список требований
                            requirements.map((requirement) => (
                                <FormControlLabel
                                    key={requirement.id}
                                    control={
                                        <Checkbox
                                            checked={selectedRequirements.includes(requirement.id)}
                                            onChange={(e) => handleRequirementChange(requirement.id, e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label={requirement.name}
                                    sx={{ display: 'block', my: 1 }}
                                />
                            ))
                        ) : (
                            // Если требований нет
                            <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
                                Для этого субботника не указаны дополнительные требования
                            </Typography>
                        )}
                    </Paper>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Status buttons */}
                <Box>
                    <Typography variant="subtitle1" gutterBottom>
                        Выберите статус вашего участия:
                    </Typography>
                    <Grid container spacing={2}>
                        {Object.values(ParticipationStatus).map((participationStatus) => (
                            <Grid item xs={12} key={participationStatus}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    color={getStatusButtonColor(participationStatus)}
                                    onClick={() => handleStatusChange(participationStatus)}
                                    sx={{
                                        justifyContent: 'center',
                                        px: 2,
                                        py: 1,
                                        opacity: status === participationStatus ? 1 : 0.7,
                                        position: 'relative',
                                    }}
                                >
                                    {status === participationStatus && (
                                        <CheckIcon sx={{ position: 'absolute', left: 10, fontSize: 20 }} />
                                    )}
                                    {participationStatus}
                                </Button>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary" variant="text">
                    Отмена
                </Button>
                <Button 
                    onClick={handleSubmit} 
                    color="success" 
                    variant="contained"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                            Сохранение...
                        </>
                    ) : 'Сохранить'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ParticipationDialog;
