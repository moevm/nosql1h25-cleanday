import './CleandaysPage.css'
import React from 'react';
import {Box, Button, Checkbox, Chip, FormControlLabel,} from '@mui/material';
import {MRT_ColumnDef, MRT_ColumnFiltersState, MRT_PaginationState, MRT_SortingState} from 'material-react-table';
import Notification from '@components/Notification.tsx';
import {useNavigate} from 'react-router-dom';
import {useGetCleandays} from "@hooks/cleanday/useGetCleandays.tsx";
import {GetCleandayParams} from '@api/cleanday/models';
import {Cleanday, CleandayStatus, CleandayTag} from "@models/Cleanday.ts";
import {PaginatedTable} from '@components/PaginatedTable/PaginatedTable';
import {
    transformStringFilters,
    transformRangeFilters,
    transformArrayFilters,
    transformDateRangeFilters
} from '@utils/filterUtils';
import {getStatusColor} from "@utils/cleanday/utils.ts";

/**
 * CleandaysPage: Компонент страницы со списком субботников.
 * Отображает таблицу субботников с возможностью поиска, сортировки, фильтрации
 * и перехода на страницу детального просмотра субботника.
 *
 * @returns {React.JSX.Element} - Возвращает JSX-элемент, представляющий страницу со списком субботников.
 */
const CleandaysPage: React.FC = (): React.JSX.Element => {
    const navigate = useNavigate();

    const [notificationMessage, setNotificationMessage] = React.useState<string | null>(null);
    const [notificationSeverity, setNotificationSeverity] = React.useState<'success' | 'info' | 'warning' | 'error'>('success');

    const handleNotificationClose = React.useCallback(() => {
        setNotificationMessage(null);
    }, [setNotificationMessage]);

    // Transform column filters to API parameters
    const transformFilters = React.useCallback((columnFilters: MRT_ColumnFiltersState): Record<string, any> => {
        // Mapping between column IDs and API parameters for string filters
        const stringFilterMap = {
            'name': 'name',
            'organization': 'organization',
            'organizer': 'organizer',
        };

        // Mapping between column IDs and API parameters for array filters
        const arrayFilterMap = {
            'status': 'status',
            'tags': 'tags',
        };

        // Mapping between column IDs and API parameters for date range filters
        const dateFromFilterMap = {
            'beginDate': 'begin_date_from',
            'endDate': 'end_date_from',
            'createdAt': 'created_at_from',
            'updatedAt': 'updated_at_from',
        };

        const dateToFilterMap = {
            'beginDate': 'begin_date_to',
            'endDate': 'end_date_to',
            'createdAt': 'created_at_to',
            'updatedAt': 'updated_at_to',
        };

        // Mapping between column IDs and API parameters for numeric range filters
        const numericFromFilterMap = {
            'area': 'area_from',
            'recommendedParticipantsCount': 'recommended_count_from',
            'participantsCount': 'participant_count_from',
        };

        const numericToFilterMap = {
            'area': 'area_to',
            'recommendedParticipantsCount': 'recommended_count_to',
            'participantsCount': 'participant_count_to',
        };

        // Transform the filters using utility functions
        const stringParams = transformStringFilters(columnFilters, stringFilterMap);
        const arrayParams = transformArrayFilters(columnFilters, arrayFilterMap);
        const dateRangeParams = transformDateRangeFilters(columnFilters, dateFromFilterMap, dateToFilterMap);
        const numericRangeParams = transformRangeFilters(columnFilters, numericFromFilterMap, numericToFilterMap);

        // Combine all parameters
        return {
            ...stringParams,
            ...arrayParams,
            ...dateRangeParams,
            ...numericRangeParams,
        };
    }, []);

    // Column definitions for the cleandays table
    const columns = React.useMemo<MRT_ColumnDef<Cleanday>[]>
    (() => [
            {
                accessorKey: 'name',
                header: 'Название',
                filterVariant: 'text',
                size: 250,
            },
            {
                accessorKey: 'city',
                header: 'Город',
                filterVariant: 'text',
                enableSorting: false, // Disable sorting for city column
                size: 140,
            },
            {
                accessorKey: 'location.address',
                header: 'Адрес',
                id: 'address',
                filterVariant: 'text',
                enableSorting: false,
                size: 200,
            },
            {
                accessorKey: 'beginDate',
                header: 'Дата начала',
                filterVariant: 'date-range',
                Cell: ({cell}) => new Date(cell.getValue<string>()).toLocaleString('ru-RU'),
                size: 350,
            },
            {
                accessorKey: 'endDate',
                header: 'Дата окончания',
                filterVariant: 'date-range',
                Cell: ({cell}) => new Date(cell.getValue<string>()).toLocaleString('ru-RU'),
                size: 350,
            },
            {
                accessorKey: 'organization',
                header: 'Организация',
                filterVariant: 'text',
                size: 140,
            },
            {
                accessorKey: 'organizer',
                header: 'Организатор',
                filterVariant: 'text',
                size: 140,
            },
            {
                accessorKey: 'tags',
                header: 'Теги',
                filterVariant: 'multi-select',
                filterSelectOptions: Object.entries(CleandayTag).map(([key, value]) => ({
                    text: value,
                    value: value,
                })),
                Cell: ({cell}) => (
                    <Box sx={{display: 'flex', gap: '4px', flexWrap: 'wrap'}}>
                        {(cell.getValue<CleandayTag[]>() || []).map((tag) => (
                            <Chip key={tag} label={tag} size="small"/>
                        ))}
                    </Box>
                ),
                size: 200,
            },
            {
                accessorKey: 'status',
                header: 'Статус',
                filterVariant: 'multi-select',
                filterSelectOptions: Object.entries(CleandayStatus).map(([key, value]) => ({
                    text: value,
                    value: value,
                })),
                Cell: ({cell}) => (
                    <Chip
                        label={cell.getValue<string>()}
                        color={getStatusColor(cell.getValue<CleandayStatus>())}
                        size="small"
                    />
                ),
                size: 120,
            },
        ],
        [getStatusColor]
    );

    // Handle click on a row to navigate to cleanday details page
    const handleRowClick = (row: Cleanday) => {
        navigate(`/cleandays/${row.id}`);
    };

    // Add this mapping object at component level, outside of any function
    const columnToApiFieldMap: Record<string, string> = {
        'name': 'name',
        'beginDate': 'begin_date',
        'endDate': 'end_date',
        'organization': 'organization',
        'area': 'area',
        'participantsCount': 'participant_count',
        'recommendedParticipantsCount': 'recommended_count',
        'status': 'status',
    };

    // Function to create query parameters for the API call
    const createQueryParams = React.useCallback(
        (
            pagination: MRT_PaginationState,
            sorting: MRT_SortingState,
            columnFilters: MRT_ColumnFiltersState,
            globalFilter?: string
        ): Record<string, unknown> => {
            const params: Record<string, unknown> = {
                offset: pagination.pageIndex * pagination.pageSize,
                limit: pagination.pageSize,
                search_query: globalFilter && globalFilter.trim() !== "" ? globalFilter.trim() : undefined,
            };

            if (sorting.length > 0) {
                // Get the column ID that is being sorted
                const sortColumnId = sorting[0].id;
                // Map it to the correct API field name or use the original if no mapping exists
                params.sort_by = columnToApiFieldMap[sortColumnId] || sortColumnId;
                params.sort_order = sorting[0].desc ? 'desc' : 'asc';
            }

            return {
                ...params,
                ...transformFilters(columnFilters),
            };
        },
        [transformFilters]
    );

    // Function to get query result based on parameters
    const getQueryHook = React.useCallback((params: Record<string, unknown>) => {
        return useGetCleandays(params);
    }, []);

    // Render toolbar actions (e.g., create cleanday button)
    const renderToolbarActions = () => (
        <></>
    );

    return (
        <Box className='cleandays-box'>
            <PaginatedTable
                title="Субботники"
                columns={columns}
                getQueryHook={getQueryHook}
                createQueryParams={createQueryParams}
                onRowClick={handleRowClick}
                renderTopToolbarCustomActions={renderToolbarActions}
            />

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

export default CleandaysPage;
