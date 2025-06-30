import React, {useState} from 'react';
import {
    MaterialReactTable,
    MRT_ColumnDef,
    MRT_ColumnFiltersState,
    MRT_PaginationState,
    MRT_RowData,
    MRT_SortingState,
    MRT_Updater,
    useMaterialReactTable,
} from 'material-react-table';
import {Box, Typography} from '@mui/material';
import {MRT_Localization_RU} from 'material-react-table/locales/ru';
import {BaseModel, BasePaginatedModel} from '@models/BaseModel.ts';
import {SortOrder} from '@api/BaseApiModel.ts';
import {UseQueryResult} from '@tanstack/react-query';


/**
 * Props for PaginatedTable with useGetPaginatedManyTemplate integration
 */
export interface PaginatedTableProps<
    Model extends BaseModel = BaseModel
> {
    /** Columns definition for the table */
    columns: MRT_ColumnDef<Model>[];

    /** Function to get hook instance with appropriate parameters */
    getQueryHook: (params: Record<string, unknown>) => UseQueryResult<BasePaginatedModel<Model>>;

    /** Function to create query parameters */
    createQueryParams?: (
        pagination: MRT_PaginationState,
        sorting: MRT_SortingState,
        columnFilters: MRT_ColumnFiltersState,
        globalFilter?: string
    ) => Record<string, unknown>;

    /** Function to transform column filter to API parameters */
    transformFilters?: (filters: MRT_ColumnFiltersState) => Record<string, unknown>;

    /** Initial state for the table */
    initialState?: {
        pagination?: MRT_PaginationState;
        sorting?: MRT_SortingState;
        columnFilters?: MRT_ColumnFiltersState;
        globalFilter?: string;
    };

    /** Table title */
    title?: string;

    /** Handler for row click */
    onRowClick?: (row: Model) => void;

    /** Custom render function for toolbar actions */
    renderTopToolbarCustomActions?: () => React.ReactNode;
}

/**
 * PaginatedTableWithTemplate: A component that uses useGetPaginatedManyTemplate hook for displaying paginated data.
 */
export function PaginatedTable<
    Model extends BaseModel = BaseModel,
>({
      columns,
      getQueryHook,
      transformFilters,
      createQueryParams,
      initialState = {},
      title,
      onRowClick,
      renderTopToolbarCustomActions,
  }: PaginatedTableProps<Model>): React.JSX.Element {
    // Table state
    const [pagination, setPagination] = useState<MRT_PaginationState>(
        initialState.pagination || {pageIndex: 0, pageSize: 10}
    );
    const [sorting, setSorting] = useState<MRT_SortingState>(
        initialState.sorting || []
    );
    const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
        initialState.columnFilters || []
    );
    const [globalFilter, setGlobalFilter] = useState<string | undefined>(
        initialState.globalFilter
    );

    // Build query parameters
    const params: Record<string, unknown> = React.useMemo(() => {
        if (createQueryParams) {
            // Use the provided createQueryParams function
            return createQueryParams(pagination, sorting, columnFilters, globalFilter);
        }

        // Legacy support: build params manually
        const baseParams: Record<string, unknown> = {
            offset: pagination.pageIndex * pagination.pageSize,
            limit: pagination.pageSize,
            search_query: globalFilter && globalFilter.trim() !== "" ? globalFilter.trim() : undefined,
        };

        // Add sorting parameters
        if (sorting.length > 0) {
            baseParams.sort_by = sorting[0].id.toString();
            baseParams.sort_order = sorting[0].desc ? SortOrder.desc : SortOrder.asc;
        }

        // Add filters from columns
        if (transformFilters) {
            const filterParams = transformFilters(columnFilters);
            Object.assign(baseParams, filterParams);
        }

        return baseParams;
    }, [pagination, sorting, columnFilters, globalFilter, transformFilters, createQueryParams]);

    // Get data using the hook
    const {data: responseData, isLoading, error} = getQueryHook(params);

    // Extract data and count from query result
    const data = responseData?.contents || [];
    const totalCount = responseData?.totalCount || 0;

    //console.log(data);

    // Handlers for table state changes
    const handleSortingChange = (updaterOrValue: MRT_Updater<MRT_SortingState>): void => {
        setSorting(updaterOrValue);
        setPagination(prev => ({...prev, pageIndex: 0}));
    };

    const handleColumnFiltersChange = (updaterOrValue: MRT_Updater<MRT_ColumnFiltersState>): void => {
        setColumnFilters(updaterOrValue);
        setPagination(prev => ({...prev, pageIndex: 0}));
    };

    const handleGlobalFilterChange = (value: string | undefined): void => {
        setGlobalFilter(value);
        setPagination(prev => ({...prev, pageIndex: 0}));
    };    // The params are automatically managed by the useMemo hook above

    // Table configuration
    const table = useMaterialReactTable({
            columns: columns as unknown as MRT_ColumnDef<MRT_RowData, unknown>[],
            data: data as Model[],
            manualPagination: true,
            manualSorting: true,
            manualFiltering: true,
            onPaginationChange: setPagination,
            onSortingChange: handleSortingChange,
            onColumnFiltersChange: handleColumnFiltersChange,
            onGlobalFilterChange: handleGlobalFilterChange,
            rowCount: totalCount,
            localization: MRT_Localization_RU,
            enableCellActions: true,
            enableColumnOrdering: false,
            enableRowSelection: false,
            enableSorting: true,
            enableColumnFilters: true,
            enableGlobalFilter: true,
            positionGlobalFilter: 'left',
            state: {
                isLoading,
                showProgressBars: isLoading,
                showAlertBanner: !!error,
                pagination,
                sorting,
                columnFilters,
                globalFilter,
            },
            initialState: {
                showGlobalFilter: true,
                density: 'compact',
            },
            muiTablePaperProps: {
                elevation: 0,
                sx: {
                    border: 'none',
                    borderRadius: '0',
                },
            },
            muiTableProps: {
                sx: {
                    tableLayout: 'fixed',
                    ...(onRowClick ? {cursor: 'pointer'} : {}),
                },
            },
            ...(onRowClick
                ? {
                    muiTableBodyRowProps: ({row}) => ({
                        onClick: () => onRowClick(row.original as unknown as Model),
                    }),
                }
                : {}),
            muiPaginationProps: {
                rowsPerPageOptions: [5, 10, 25, 50],
                showFirstButton: true,
                showLastButton: true,
            },
            renderTopToolbarCustomActions: renderTopToolbarCustomActions,
            muiToolbarAlertBannerProps:
                error
                    ? {
                        color: 'error',
                        children: `Ошибка загрузки данных: ${
                            error.message || 'Неизвестная ошибка'
                        }`,
                    }
                    : undefined,
            muiTableBodyRowProps: ({row}) => ({
                onClick: () => onRowClick?.(row.original as unknown as Model),
                sx: {cursor: onRowClick ? 'pointer' : 'default'},
            }),
        })
    ;
    return (
        <Box>
            {title && (
                <Typography variant="h4" sx={{margin: '10px 0px 0px 20px', color: 'black'}}>
                    {title}
                </Typography>
            )}
            <MaterialReactTable table={table}/>
        </Box>
    );
}
