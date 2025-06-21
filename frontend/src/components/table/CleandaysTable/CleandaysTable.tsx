import React from 'react';
import {Box, Button, Chip,} from '@mui/material';
import {MRT_ColumnDef, MRT_ColumnFiltersState, MRT_PaginationState, MRT_SortingState} from 'material-react-table';
import {Cleanday, CleandayStatus, CleandayTag} from "@models/Cleanday.ts";
import Notification from '@components/Notification.tsx';
import {PaginatedTable} from '@components/table/PaginatedTable/PaginatedTable';
import {transformArrayFilters, transformDateRangeFilters, transformStringFilters} from '@utils/filterUtils';
import {getStatusColor} from "@utils/cleanday/utils.ts";
import {createQueryParams} from '@utils/api/createQueryParams';
import {UseQueryResult} from "@tanstack/react-query";
import {BasePaginatedModel} from "@models/BaseModel.ts";


export interface CleandaysTableProps {
    isRenderTopToolbarCustomActions: boolean,
    isShowTitle: boolean,
    handleRowClick: (cleanday: Cleanday) => void,
    getQueryHook: (params: Record<string, unknown>) => UseQueryResult<BasePaginatedModel<Cleanday>>;
}

const CleandaysTable: React.FC<CleandaysTableProps> = ({
                                                           isRenderTopToolbarCustomActions,
                                                           isShowTitle,
                                                           handleRowClick,
                                                           getQueryHook,
                                                       }: CleandaysTableProps): React.JSX.Element => {
    const [notificationMessage, setNotificationMessage] = React.useState<string | null>(null);
    const [notificationSeverity, setNotificationSeverity] = React.useState<'success' | 'info' | 'warning' | 'error'>('success');

    const handleNotificationClose = React.useCallback(() => {
        setNotificationMessage(null);
    }, [setNotificationMessage]);

    // Transform column filters to API parameters
    const transformFilters = React.useCallback((columnFilters: MRT_ColumnFiltersState): Record<string, unknown> => {
        // Mapping between column IDs and API parameters for string filters
        const stringFilterMap = {
            'name': 'name',
            'city': 'city',
            'address': 'address',
            'organization': 'organization',
            'organizer': 'organizer',
        };

        const arrayFilterMap = {
            'status': 'status',
            'tags': 'tags',
        };

        const dateFromFilterMap = {
            'beginDate': 'begin_date_from',
            'endDate': 'end_date_from',
            // 'createdAt': 'created_at_from',
            // 'updatedAt': 'updated_at_from',
        };

        const dateToFilterMap = {
            'beginDate': 'begin_date_to',
            'endDate': 'end_date_to',
            // 'createdAt': 'created_at_to',
            // 'updatedAt': 'updated_at_to',
        };

        // const numericFromFilterMap = {
        //     'area': 'area_from',
        //     'recommendedParticipantsCount': 'recommended_count_from',
        //     'participantsCount': 'participant_count_from',
        // };
        //
        // const numericToFilterMap = {
        //     'area': 'area_to',
        //     'recommendedParticipantsCount': 'recommended_count_to',
        //     'participantsCount': 'participant_count_to',
        // };

        const stringParams = transformStringFilters(columnFilters, stringFilterMap);
        const arrayParams = transformArrayFilters(columnFilters, arrayFilterMap);
        const dateRangeParams = transformDateRangeFilters(columnFilters, dateFromFilterMap, dateToFilterMap);
        // const numericRangeParams = transformNumericRangeFilters(columnFilters, numericFromFilterMap, numericToFilterMap);

        // Combine all parameters
        return {
            ...stringParams,
            ...arrayParams,
            ...dateRangeParams,
            // ...numericRangeParams,
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
                enableSorting: false,
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
                filterVariant: 'datetime-range',
                Cell: ({cell}) => new Date(cell.getValue<string>()).toLocaleString('ru-RU'),
                size: 350,
            },
            {
                accessorKey: 'endDate',
                header: 'Дата окончания',
                filterVariant: 'datetime-range',
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
                enableSorting: false,
                size: 140,
            },
            {
                accessorKey: 'tags',
                header: 'Теги',
                filterVariant: 'multi-select',
                filterSelectOptions: Object.entries(CleandayTag).map(([, value]) => ({
                    text: value,
                    value: value,
                })),
                enableSorting: false,
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
                filterSelectOptions: Object.entries(CleandayStatus).map(([, value]) => ({
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
        []
    );

    const columnToApiFieldMap: Record<string, string> = React.useMemo(() => ({
        'name': 'name',
        'beginDate': 'begin_date',
        'endDate': 'end_date',
        'organizer': 'organizer',
        'organization': 'organization',
        // 'area': 'area',
        // 'participantsCount': 'participant_count',
        // 'recommendedParticipantsCount': 'recommended_count',
        'status': 'status',
        'city': 'city',
        'address': 'address',
    }), []);

    // Function to create query parameters for the API call
    const createCleandaysQueryParams = React.useCallback(
        (
            pagination: MRT_PaginationState,
            sorting: MRT_SortingState,
            columnFilters: MRT_ColumnFiltersState,
            globalFilter?: string
        ): Record<string, unknown> => {
            return createQueryParams(
                pagination,
                sorting,
                columnFilters,
                globalFilter,
                columnToApiFieldMap,
                transformFilters
            );
        },
        [columnToApiFieldMap, transformFilters]
    );

    const handlePlotButtonClick = () => {
        setNotificationMessage('График построен успешно!');
        setNotificationSeverity('success');
    };

    const renderTopToolbarCustomActions = React.useCallback(() => {
        return (
            isRenderTopToolbarCustomActions ? (
                <Box sx={{display: 'flex', width: '100%', justifyContent: 'flex-start'}}>
                    <Button
                        variant="outlined"
                        onClick={handlePlotButtonClick}
                        sx={{color: 'black', borderColor: 'black'}}
                    >
                        Построить график
                    </Button>
                </Box>
            ) : <div/>
        )
    }, [isRenderTopToolbarCustomActions]);

    return (
        <Box>
            <PaginatedTable
                title={isShowTitle ? "Субботники" : ''}
                columns={columns}
                getQueryHook={getQueryHook}
                createQueryParams={createCleandaysQueryParams}
                onRowClick={handleRowClick}
                renderTopToolbarCustomActions={renderTopToolbarCustomActions}
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

export default CleandaysTable;
