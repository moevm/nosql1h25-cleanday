import {MRT_ColumnFiltersState} from 'material-react-table';

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
export const transformNumericRangeFilters = (
    columnFilters: MRT_ColumnFiltersState,
    fromFilterMap: Record<string, string>,
    toFilterMap: Record<string, string>
): Record<string, string> => {
    const params: Record<string, string> = {};

    columnFilters.forEach(filter => {
        const filterId = filter.id;
        const filterValue = filter.value;

        if (Array.isArray(filterValue) && filterValue.length === 2) {
            const [min, max] = filterValue;

            // Добавляем минимальное значение, если оно существует и есть соответствующее поле в fromFilterMap
            if (min && fromFilterMap[filterId]) {
                const minValue = typeof min === 'string' ? parseInt(min) : min;
                if (!isNaN(minValue)) {
                    params[fromFilterMap[filterId]] = String(minValue);
                }
            }

            // Добавляем максимальное значение, если оно существует и есть соответствующее поле в toFilterMap
            if (max && toFilterMap[filterId]) {
                const maxValue = typeof max === 'string' ? parseInt(max) : max;
                if (!isNaN(maxValue)) {
                    params[toFilterMap[filterId]] = String(maxValue);
                }
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
            params[filterMap[filterId]] = Array.isArray(filter.value) ? filter.value : [filter.value as string];
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

        // Проверяем, является ли значение массивом (формат MRT date-range)
        if (Array.isArray(filterValue) && filterValue.length === 2) {
            const [startDate, endDate] = filterValue;

            // Обработка начальной даты
            if (startDate && fromFilterMap[filterId]) {
                try {
                    // Проверяем, является ли объект dayjs объектом
                    if (startDate.$d instanceof Date) {
                        params[fromFilterMap[filterId]] = startDate.$d.toISOString();
                        console.log(`Added ${fromFilterMap[filterId]}:`, params[fromFilterMap[filterId]]);
                    } else {
                        // Попытка прямого преобразования
                        const date = new Date(startDate);
                        if (!isNaN(date.getTime())) {
                            params[fromFilterMap[filterId]] = date.toISOString();
                            console.log(`Added ${fromFilterMap[filterId]}:`, params[fromFilterMap[filterId]]);
                        }
                    }
                } catch (e) {
                    console.error(`Error processing start date for filter ${filterId}:`, e);
                }
            }

            // Обработка конечной даты
            if (endDate && toFilterMap[filterId]) {
                try {
                    // Проверяем, является ли объект dayjs объектом
                    if (endDate.$d instanceof Date) {
                        params[toFilterMap[filterId]] = endDate.$d.toISOString();
                        console.log(`Added ${toFilterMap[filterId]}:`, params[toFilterMap[filterId]]);
                    } else {
                        // Попытка прямого преобразования
                        const date = new Date(endDate);
                        if (!isNaN(date.getTime())) {
                            params[toFilterMap[filterId]] = date.toISOString();
                            console.log(`Added ${toFilterMap[filterId]}:`, params[toFilterMap[filterId]]);
                        }
                    }
                } catch (e) {
                    console.error(`Error processing end date for filter ${filterId}:`, e);
                }
            }
        }
    });

    return params;
};
