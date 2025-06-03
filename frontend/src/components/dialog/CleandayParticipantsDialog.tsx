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
    InputAdornment,
    Chip
} from '@mui/material';
import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import { ParticipationStatus } from '@/models/User';

// Interface for a participant
export interface CleandayParticipant {
    id: number;
    name: string;
    login: string;
    status: ParticipationStatus;
}

// Interface for the dialog props
interface CleandayParticipantsDialogProps {
    open: boolean;
    onClose: () => void;
    cleandayName: string;
    participants: CleandayParticipant[];
}

/**
 * CleandayParticipantsDialog: Компонент для отображения списка участников субботника.
 * Показывает таблицу со всеми зарегистрированными участниками и их статусами.
 * 
 * @param props - Пропсы компонента
 * @returns React компонент
 */
const CleandayParticipantsDialog: React.FC<CleandayParticipantsDialogProps> = ({
    open,
    onClose,
    cleandayName,
    participants
}: CleandayParticipantsDialogProps): React.JSX.Element => {
    // State for search functionality
    const [searchText, setSearchText] = useState<string>('');

    // Handle search input changes
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value);
    };

    // Filter participants based on search text
    const filteredParticipants = React.useMemo(() => {
        if (!searchText) {
            return participants;
        }
        
        const lowerCaseSearchText = searchText.toLowerCase();
        return participants.filter((participant) => 
            participant.name.toLowerCase().includes(lowerCaseSearchText) ||
            participant.login.toLowerCase().includes(lowerCaseSearchText) ||
            participant.status.toLowerCase().includes(lowerCaseSearchText)
        );
    }, [participants, searchText]);

    /**
     * Получить цвет для статуса участника
     */
    const getStatusColor = (status: ParticipationStatus): "success" | "error" | "warning" | "info" | "default" => {
        switch (status) {
            case ParticipationStatus.GOING:
                return "success";
            case ParticipationStatus.LATE:
                return "info";
            case ParticipationStatus.MAYBE:
                return "warning";
            case ParticipationStatus.NOT_GOING:
                return "error";
            default:
                return "default";
        }
    };

    /**
     * Получить иконку для статуса участника
     */
    const getStatusIcon = (status: ParticipationStatus) => {
        switch (status) {
            case ParticipationStatus.GOING:
                return <CheckCircleIcon fontSize="small" />;
            case ParticipationStatus.LATE:
                return <AccessTimeIcon fontSize="small" />;
            case ParticipationStatus.MAYBE:
                return <HourglassEmptyIcon fontSize="small" />;
            case ParticipationStatus.NOT_GOING:
                return <CancelIcon fontSize="small" />;
            default:
                return null;
        }
    };

    // Define table columns
    const columns = React.useMemo<MRT_ColumnDef<CleandayParticipant>[]>(
        () => [
            {
                id: 'name',
                header: 'Имя и фамилия',
                accessorKey: 'name',
                size: 200,
            },
            {
                id: 'login',
                header: 'Логин',
                accessorKey: 'login',
                size: 150,
            },
            {
                id: 'status',
                header: 'Статус участия',
                accessorKey: 'status',
                size: 200,
                Cell: ({ row }) => (
                    <Chip
                        label={row.original.status}
                        color={getStatusColor(row.original.status)}
                        icon={getStatusIcon(row.original.status)}
                        size="small"
                    />
                ),
            },
        ],
        []
    );

    // Configure the table
    const table = useMaterialReactTable({
        columns,
        data: filteredParticipants,
        enableColumnOrdering: false,
        enableRowSelection: false,
        enableSorting: true,
        enableColumnFilters: true,
        enableGlobalFilter: false,
        initialState: {
            density: 'compact',
            pagination: { pageIndex: 0, pageSize: 10 },
            sorting: [{ id: 'status', desc: false }], // Sort by status by default
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
            maxWidth="md"
            fullWidth
            aria-labelledby="cleanday-participants-dialog-title"
        >
            <DialogTitle id="cleanday-participants-dialog-title">
                Участники субботника
                <Typography component="div" variant="subtitle1" color="text.secondary">
                    {cleandayName}
                </Typography>
            </DialogTitle>
            
            <DialogContent>
                <Box sx={{ mb: 2, mt: 1 }}>
                    <TextField
                        label="Поиск участников"
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
                
                {filteredParticipants.length === 0 && (
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        p: 4 
                    }}>
                        <Typography color="text.secondary">
                            {searchText ? 'Нет участников, соответствующих поисковому запросу' : 'Нет зарегистрированных участников'}
                        </Typography>
                    </Box>
                )}
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">
                        Всего участников: <b>{participants.length}</b>
                    </Typography>
                    <Typography variant="body2">
                        Точно пойдут: <b>{participants.filter(p => p.status === ParticipationStatus.GOING).length}</b>
                    </Typography>
                    <Typography variant="body2">
                        Опоздают: <b>{participants.filter(p => p.status === ParticipationStatus.LATE).length}</b>
                    </Typography>
                    <Typography variant="body2">
                        Возможно пойдут: <b>{participants.filter(p => p.status === ParticipationStatus.MAYBE).length}</b>
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

export default CleandayParticipantsDialog;
