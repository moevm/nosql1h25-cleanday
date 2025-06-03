import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Chip
} from '@mui/material';
import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import { useNavigate } from 'react-router-dom';
import { Cleanday, CleanDayTag } from '@/models/User';

// Interface for the dialog props
interface OrganizedCleandaysDialogProps {
    open: boolean;
    onClose: () => void;
    userName: string;
    cleandays: Cleanday[];
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
    userName,
    cleandays
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
        navigate(`/cleandays/${cleanday.key}`);
    }, [navigate, onClose]);

    // Define table columns
    const columns = React.useMemo<MRT_ColumnDef<Cleanday>[]>(
        () => [
            {
                accessorKey: 'name',
                header: 'Название',
            },
            {
                accessorFn: (row) => row.city,
                header: 'Город',
                id: 'city',
            },
            {
                accessorFn: (row) => row.location.address,
                header: 'Адрес',
                id: 'address',
            },
            {
                accessorKey: 'begin_date',
                header: 'Дата и время начала',
            },
            {
                accessorKey: 'end_date',
                header: 'Дата и время завершения',
            },
            {
                accessorKey: 'organization',
                header: 'Организация',
            },
            {
                accessorKey: 'organizer',
                header: 'Организатор',
            },
            {
                header: 'Тип',
                id: 'type',
                // Кастомное отображение тегов как компонентов Chip
                Cell: ({row}) => (
                    <Box sx={{display: 'flex', gap: 1}}>
                        {row.original.tags.map((tag) => (
                            <Chip key={tag} label={tag} size="small"/>
                        ))}
                    </Box>
                ),
            },
            {
                header: 'Статус',
                accessorKey: 'status',
                // Кастомное отображение статуса с цветовым выделением
                Cell: ({row}) => {
                    let color: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | undefined;
                    switch (row.original.status) {
                        case 'Запланировано':
                            color = 'primary';
                            break;
                        case 'Завершен':
                            color = 'success';
                            break;
                        case 'Отменен':
                            color = 'error';
                            break;
                        case 'Проходит':
                            color = 'info';
                            break;
                        case 'Перенесён':
                            color = 'warning';
                            break;
                        default:
                            break;
                    }
                    return <Chip label={row.original.status} size="small" color={color}/>;
                },
            },
        ],
        []
    );

    // Configure the table with built-in search functionality
    const table = useMaterialReactTable({
        columns,
        data: cleandays,
        enableColumnOrdering: false,
        enableRowSelection: false,
        enableSorting: true,
        enableColumnFilters: true,
        positionGlobalFilter: 'left',
        enableGlobalFilter: true, // Enable built-in search
        enableColumnFilterModes: true,
        initialState: {
            density: 'compact',
            pagination: { pageIndex: 0, pageSize: 10 },
            showGlobalFilter: true, // Show search bar by default
        },
        muiTablePaperProps: {
            elevation: 0,
            sx: {
                border: '1px solid rgba(224, 224, 224, 1)',
                borderRadius: '4px',
            },
        },
        // Configure the search input appearance
        muiSearchTextFieldProps: {
            placeholder: 'Поиск субботников',
            size: 'small',
            sx: { mb: 2 },
            variant: 'outlined',
        },
        // Set row click handler
        muiTableBodyRowProps: ({row}) => ({
            onClick: () => handleRowClick(row.original),
            sx: { cursor: 'pointer' },
        }),
    });

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
                    {userName}
                </Typography>
            </DialogTitle>
            
            <DialogContent>
                <MaterialReactTable table={table} />
                
                {cleandays.length === 0 && (
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
                )}
                
                <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                        Всего организовано субботников: <b>{cleandays.length}</b>
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
