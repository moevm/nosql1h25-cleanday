import {MRT_ColumnFiltersState} from 'material-react-table';

/**
 * Interface for range filter values
 */
interface RangeFilter {
    min?: number;
    max?: number;
}

/**
 * Utility function to transform MRT column filters to API parameters for string filters
 */
export const transformStringFilters = (
    columnFilters: MRT_ColumnFiltersState,
    filterMap: Record<string, string>
): Record<string, string> => {
    const params: Record<string, string> = {};

    columnFilters.forEach(filter => {
        const filterId = filter.id;

        // If this filter has a mapping in filterMap
        if (filterMap[filterId] && filter.value) {
            params[filterMap[filterId]] = String(filter.value);
        }
    });

    return params;
};

/**
 * Utility function to transform MRT column filters to API parameters for range filters
 */
export const transformRangeFilters = (
    columnFilters: MRT_ColumnFiltersState,
    fromFilterMap: Record<string, string>,
    toFilterMap: Record<string, string>
): Record<string, string> => {
    const params: Record<string, string> = {};

    columnFilters.forEach(filter => {
        const filterId = filter.id;
        const filterValue = filter.value;

        if (filterValue && typeof filterValue === 'object') {
            const range = filterValue as RangeFilter;

            // Add from filter if it exists in the map and has a min value
            if (fromFilterMap[filterId] && typeof range.min === 'number') {
                params[fromFilterMap[filterId]] = String(range.min);
            }

            // Add to filter if it exists in the map and has a max value
            if (toFilterMap[filterId] && typeof range.max === 'number') {
                params[toFilterMap[filterId]] = String(range.max);
            }
        }
    });

    return params;
};

/**
 * Utility function to transform MRT column filters to API parameters for array filters
 */
export const transformArrayFilters = (
    columnFilters: MRT_ColumnFiltersState,
    filterMap: Record<string, string>
): Record<string, string[]> => {
    const params: Record<string, string[]> = {};

    columnFilters.forEach(filter => {
        const filterId = filter.id;

        // If this filter has a mapping in filterMap and has a value
        if (filterMap[filterId] && filter.value) {
            // Array filters can be single values or arrays
            const filterValue = Array.isArray(filter.value) ? filter.value : [filter.value as string];
            params[filterMap[filterId]] = filterValue;
        }
    });

    return params;
};

/**
 * Utility function to transform MRT column filters to API parameters for date range filters
 */
export const transformDateRangeFilters = (
    columnFilters: MRT_ColumnFiltersState,
    fromFilterMap: Record<string, string>,
    toFilterMap: Record<string, string>
): Record<string, string> => {
    const params: Record<string, string> = {};

    columnFilters.forEach(filter => {
        const filterId = filter.id;
        const filterValue = filter.value;

        if (filterValue && typeof filterValue === 'object') {
            const range = filterValue as {min?: Date, max?: Date};

            // Add from filter if it exists in the map and has a min value
            if (fromFilterMap[filterId] && range.min) {
                params[fromFilterMap[filterId]] = range.min.toISOString();
            }

            // Add to filter if it exists in the map and has a max value
            if (toFilterMap[filterId] && range.max) {
                params[toFilterMap[filterId]] = range.max.toISOString();
            }
        }
    });

    return params;
};
