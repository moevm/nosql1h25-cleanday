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
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import {ParticipationData, ParticipationStatus, Requirement} from "../../models/User.ts";

/**
 * Интерфейс для пропсов компонента ParticipationDialog
 */
interface ParticipationDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: ParticipationData) => void;
    requirements: Requirement[];
    initialStatus?: ParticipationStatus;
    initialRequirements?: number[];
    cleandayName: string;
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
    requirements,
    initialStatus = ParticipationStatus.GOING,
    initialRequirements = [],
    cleandayName,
}: ParticipationDialogProps): React.JSX.Element => {
    // Состояния
    const [status, setStatus] = useState<ParticipationStatus>(initialStatus);
    const [selectedRequirements, setSelectedRequirements] = useState<number[]>(initialRequirements);

    // Сброс состояний при открытии диалога с новыми начальными значениями
    useEffect(() => {
        if (open) {
            setStatus(initialStatus);
            setSelectedRequirements(initialRequirements);
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
     * Обработчик отправки формы
     */
    const handleSubmit = () => {
        onSubmit({
            status,
            selectedRequirements,
        });
        onClose();
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

    // Render component once with current state values
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                Участие в субботнике
                <Typography component="div" variant="subtitle1" color="text.secondary">
                    {cleandayName}
                </Typography>
            </DialogTitle>
            <DialogContent>
                {/* Requirements section */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Подтвердите соответствие требованиям:
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        {requirements.map((requirement) => (
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
                        ))}
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
                >
                    Сохранить
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ParticipationDialog;
