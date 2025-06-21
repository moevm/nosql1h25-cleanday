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

    // // Define table columns
    // const columns = React.useMemo<MRT_ColumnDef<Cleanday>[]>(
    //     () => [
    //         {
    //             accessorKey: 'name',
    //             header: 'Название',
    //         },
    //         {
    //             accessorFn: (row) => row.city,
    //             header: 'Город',
    //             id: 'city',
    //             size: 90,
    //         },
    //         {
    //             accessorFn: (row) => row.location.address,
    //             header: 'Адрес',
    //             id: 'address',
    //         },
    //         {
    //             accessorKey: 'begin_date',
    //             header: 'Дата и время начала',
    //
    //         },
    //         {
    //             accessorKey: 'end_date',
    //             header: 'Дата и время завершения',
    //         },
    //         {
    //             accessorKey: 'organization',
    //             header: 'Организация',
    //             size: 150,
    //         },
    //         {
    //             accessorKey: 'organizer',
    //             header: 'Организатор',
    //             size: 150,
    //         },
    //         {
    //             accessorKey: 'type',
    //             header: 'Теги',
    //             // Кастомное отображение тегов как компонентов Chip
    //             Cell: ({row}) => (
    //                 <Box sx={{display: 'flex', gap: 1}}>
    //                     {row.original.tags.map((tag) => (
    //                         <Chip key={tag} label={tag} size="small"/>
    //                     ))}
    //                 </Box>
    //             ),
    //             filterVariant: 'multi-select',
    //             filterSelectOptions: Object.entries(CleandayTag).map(([key, value]) => ({
    //                 text: value,
    //                 value: value,
    //             })),
    //         },
    //         {
    //             accessorKey: 'status',
    //             header: 'Статус',
    //             filterVariant: 'multi-select',
    //             filterSelectOptions: Object.entries(CleandayStatus).map(([key, value]) => ({
    //                 text: value,
    //                 value: value,
    //             })),
    //             Cell: ({ cell }) => (
    //                 <Chip
    //                     label={cell.getValue<string>()}
    //                     color={getStatusColor(cell.getValue<CleandayStatus>())}
    //                     size="small"
    //                 />
    //             ),
    //             size: 120,
    //         },
    //     ],
    //     [getStatusColor]
    // );
    //
    //
    // // Configure the table with built-in search functionality
    // const table = useMaterialReactTable({
    //     columns,
    //     data: cleandays,
    //     enableColumnOrdering: false,
    //     enableRowSelection: false,
    //     enableSorting: true,
    //     enableColumnFilters: true,
    //     positionGlobalFilter: 'left',
    //     enableGlobalFilter: true, // Enable built-in search
    //     enableColumnFilterModes: true,
    //     initialState: {
    //         density: 'compact',
    //         pagination: { pageIndex: 0, pageSize: 10 },
    //         showGlobalFilter: true, // Show search bar by default
    //     },
    //     muiTablePaperProps: {
    //         elevation: 0,
    //         sx: {
    //             border: '1px solid rgba(224, 224, 224, 1)',
    //             borderRadius: '4px',
    //         },
    //     },
    //     // Configure the search input appearance
    //     muiSearchTextFieldProps: {
    //         placeholder: 'Поиск субботников',
    //         size: 'small',
    //         sx: { mb: 2 },
    //         variant: 'outlined',
    //     },
    //     muiTableBodyRowProps: ({row}) => ({
    //         onClick: () => handleRowClick(row.original),
    //         sx: { cursor: 'pointer' },
    //     }),
    // });

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

