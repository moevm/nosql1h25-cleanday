import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    TextField,
    InputAdornment
} from '@mui/material';
import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import SearchIcon from '@mui/icons-material/Search';

// Interface for a history entry
export interface CleanDayHistoryEntry {
    id: number;
    userName: string;
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
    // State for search functionality
    const [searchText, setSearchText] = useState<string>('');

    // Handle search input changes
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value);
    };

    // Filter history entries based on search text
    const filteredHistoryEntries = React.useMemo(() => {
        if (!searchText) {
            return historyEntries;
        }
        
        const lowerCaseSearchText = searchText.toLowerCase();
        return historyEntries.filter((entry) => 
            entry.userName.toLowerCase().includes(lowerCaseSearchText) ||
            entry.action.toLowerCase().includes(lowerCaseSearchText) ||
            entry.details.toLowerCase().includes(lowerCaseSearchText) ||
            entry.date.toLowerCase().includes(lowerCaseSearchText)
        );
    }, [historyEntries, searchText]);

    // Define table columns
    const columns = React.useMemo<MRT_ColumnDef<CleanDayHistoryEntry>[]>(
        () => [
            {
                id: 'userName',
                header: 'Пользователь',
                accessorKey: 'userName',
                size: 180,
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

    // Configure the table
    const table = useMaterialReactTable({
        columns,
        data: filteredHistoryEntries,
        enableColumnOrdering: false,
        enableRowSelection: false,
        enableSorting: true,
        enableColumnFilters: true,
        enableGlobalFilter: false,
        initialState: {
            density: 'compact',
            pagination: { pageIndex: 0, pageSize: 10 },
            sorting: [{ id: 'date', desc: true }], // Sort by date descending by default
        },
        muiTablePaperProps: {
            elevation: 0,
            sx: {
                border: '1px solid rgba(224, 224, 224, 1)',
                borderRadius: '4px',
            },
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
                <Box sx={{ mb: 2, mt: 1 }}>
                    <TextField
                        label="Поиск по истории"
                        value={searchText}
                        onChange={handleSearchChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        size="small"
                        fullWidth
                    />
                </Box>
                
                <MaterialReactTable table={table} />
                
                {filteredHistoryEntries.length === 0 && (
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        p: 4 
                    }}>
                        <Typography color="text.secondary">
                            {searchText ? 'Нет записей, соответствующих поисковому запросу' : 'История активности пуста'}
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
