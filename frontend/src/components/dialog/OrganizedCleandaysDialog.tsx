import React from 'react';
import {Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {Cleanday} from "@models/Cleanday.ts";
import CleandaysTable from '../table/CleandaysTable/CleandaysTable';
import {useGetUserOrganizedCleandays} from "@hooks/user/useGetUserOrganizedCleandays.tsx";
import {User} from "@models/User.ts";


// Interface for the dialog props
interface OrganizedCleandaysDialogProps {
    open: boolean;
    onClose: () => void;
    user: User;
    cleandaysCount: number;
}

/**
 * OrganizedCleandaysDialog: Компонент для отображения списка субботников, организованных пользователем.
 * Показывает таблицу со всеми субботниками, организованными данным пользователем, с возможностью поиска и перехода к детальной странице.
 *
 * @param props - Пропсы компонента
 * @returns React компонент
 */
const OrganizedCleandaysDialog: React.FC<OrganizedCleandaysDialogProps> = ({
                                                                               open,
                                                                               onClose,
                                                                               user,
                                                                               cleandaysCount,
                                                                           }: OrganizedCleandaysDialogProps): React.JSX.Element => {
    // Хук для навигации между страницами приложения
    const navigate = useNavigate();

    /**
     * Обработчик клика по строке таблицы.
     * Осуществляет переход на страницу детального просмотра выбранного субботника.
     *
     * @param {Cleanday} cleanday - Объект субботника, по которому был совершен клик.
     */
    const handleRowClick = React.useCallback((cleanday: Cleanday) => {
        onClose();
        navigate(`/cleandays/${cleanday.id}`);
    }, [navigate, onClose]);

    const getQueryHook = React.useCallback((params: Record<string, unknown>) => {
        // всё работает как должно, не понимаю почему возникают ошибки от инлайнера
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useGetUserOrganizedCleandays(user.id, params);
    }, [user.id]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            aria-labelledby="organized-cleandays-dialog-title"
        >
            <DialogTitle id="organized-cleandays-dialog-title">
                Организованные субботники
                <Typography component="div" variant="subtitle1" color="text.secondary">
                    {`${user.firstName} ${user.lastName}`}
                </Typography>
            </DialogTitle>

            <DialogContent>
                {cleandaysCount !== 0
                    ?
                    <CleandaysTable
                        isRenderTopToolbarCustomActions={false}
                        isShowTitle={false}
                        handleRowClick={handleRowClick}
                        getQueryHook={getQueryHook}
                    />
                    :
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        p: 4
                    }}>
                        <Typography color="text.secondary">
                            Нет организованных субботников
                        </Typography>
                    </Box>
                }

                <Box sx={{mt: 2}}>
                    <Typography variant="body2">
                        Всего организовано субботников: <b>{cleandaysCount}</b>
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Закрыть
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default OrganizedCleandaysDialog;

