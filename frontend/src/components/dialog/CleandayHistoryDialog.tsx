import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography
} from '@mui/material';
import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef } from 'material-react-table';

// Interface for a history entry
export interface CleanDayHistoryEntry {
    id: number;
    firstName: string;
    lastName: string;
    date: string;
    action: string;
    details: string;
}

// Interface for the dialog props
interface CleandayHistoryDialogProps {
    open: boolean;
    onClose: () => void;
    cleandayName: string;
    historyEntries: CleanDayHistoryEntry[];
}

/**
 * CleandayHistoryDialog: Компонент для отображения истории активности субботника.
 * Показывает таблицу со всеми изменениями и действиями, связанными с субботником.
 * 
 * @param props - Пропсы компонента
 * @returns React компонент
 */
const CleandayHistoryDialog: React.FC<CleandayHistoryDialogProps> = ({
    open,
    onClose,
    cleandayName,
    historyEntries
}: CleandayHistoryDialogProps): React.JSX.Element => {
    // Define table columns
    const columns = React.useMemo<MRT_ColumnDef<CleanDayHistoryEntry>[]>
    (
        () => [
            {
                id: 'firstName',
                header: 'Имя',
                accessorKey: 'firstName',
                size: 120,
            },
            {
                id: 'lastName',
                header: 'Фамилия',
                accessorKey: 'lastName',
                size: 120,
            },
            {
                id: 'date',
                header: 'Дата и время',
                accessorKey: 'date',
                size: 150,
            },
            {
                id: 'action',
                header: 'Действие',
                accessorKey: 'action',
                size: 150,
            },
            {
                id: 'details',
                header: 'Подробности',
                accessorKey: 'details',
                minSize: 200,
                Cell: ({ row }) => (
                    <Typography 
                        sx={{ 
                            whiteSpace: 'pre-wrap', 
                            wordBreak: 'break-word' 
                        }}
                    >
                        {row.original.details}
                    </Typography>
                )
            },
        ],
        []
    );

    // Configure the table with built-in search functionality
    const table = useMaterialReactTable({
        columns,
        data: historyEntries,
        enableColumnOrdering: false,
        enableRowSelection: false,
        enableSorting: true,
        enableColumnFilters: true,
        enableGlobalFilter: true, // Enable built-in search
        enableColumnFilterModes: true,
        initialState: {
            density: 'compact',
            pagination: { pageIndex: 0, pageSize: 10 },
            sorting: [{ id: 'date', desc: true }], // Sort by date descending by default
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
            placeholder: 'Поиск по истории',
            size: 'small',
            sx: { mb: 2 },
            variant: 'outlined',
        },
    });

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            aria-labelledby="cleanday-history-dialog-title"
        >
            <DialogTitle id="cleanday-history-dialog-title">
                История активности субботника
                <Typography component="div" variant="subtitle1" color="text.secondary">
                    {cleandayName}
                </Typography>
            </DialogTitle>
            
            <DialogContent>
                {/* Remove custom search TextField since we're using MRT's built-in search */}
                
                <MaterialReactTable table={table} />
                
                {historyEntries.length === 0 && (
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        p: 4 
                    }}>
                        <Typography color="text.secondary">
                            История активности пуста
                        </Typography>
                    </Box>
                )}
            </DialogContent>
            
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Закрыть
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CleandayHistoryDialog;
