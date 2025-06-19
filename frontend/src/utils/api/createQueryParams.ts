import { MRT_ColumnFiltersState, MRT_PaginationState, MRT_SortingState } from 'material-react-table';
import { SortOrder } from "@api/BaseApiModel";

/**
 * Функция для создания параметров запроса к API на основе состояния таблицы
 * 
 * @param pagination - состояние пагинации таблицы
 * @param sorting - состояние сортировки таблицы
 * @param columnFilters - состояние фильтрации столбцов
 * @param globalFilter - строка глобального поиска
 * @param columnToApiFieldMap - карта соответствия между ID столбцов и полями API
 * @param transformFilters - функция преобразования фильтров столбцов в параметры API
 * @returns объект с параметрами для запроса к API
 */
export const createQueryParams = (
    pagination: MRT_PaginationState,
    sorting: MRT_SortingState,
    columnFilters: MRT_ColumnFiltersState,
    globalFilter?: string,
    columnToApiFieldMap?: Record<string, string>,
    transformFilters?: (filters: MRT_ColumnFiltersState) => Record<string, unknown>
): Record<string, unknown> => {
    // Базовые параметры для пагинации и поиска
    const params: Record<string, unknown> = {
        offset: pagination.pageIndex * pagination.pageSize,
        limit: pagination.pageSize,
        search_query: globalFilter && globalFilter.trim() !== "" ? globalFilter.trim() : undefined,
    };

    // Добавление параметров сортировки
    if (sorting.length > 0) {
        const sortColumnId = sorting[0].id;
        // Используем маппинг полей, если он предоставлен
        params.sort_by = columnToApiFieldMap && columnToApiFieldMap[sortColumnId] 
            ? columnToApiFieldMap[sortColumnId] 
            : sortColumnId;
        params.sort_order = sorting[0].desc ? SortOrder.desc : SortOrder.asc;
    }

    // Добавляем параметры фильтрации, если предоставлена функция трансформации
    if (transformFilters) {
        return {
            ...params,
            ...transformFilters(columnFilters),
        };
    }

    return params;
};