import { UseQueryOptions } from '@tanstack/react-query';
import qs from 'qs';

import { useGetPaginatedManyTemplate } from '@hooks/templates/get/useGetPaginatedManyTemplate.tsx';
import { GET_CLEANDAY_GRAPH } from '@api/statistics/endpoints.ts';
import { CleandayHeatmapParams, HeatmapEntry, HeatmapResponse } from '@api/statistics/models.ts';
import { BasePaginatedModel } from '@models/BaseModel.ts';

/**
 * Hook for fetching cleanday heatmap data
 * @param params - Query parameters for the heatmap
 * @param options - Additional query options
 * @returns Query result with heatmap data
 */
export function useGetCleandayHeatmap(
    params: CleandayHeatmapParams,
    options?: Omit<UseQueryOptions<BasePaginatedModel<HeatmapEntry>>, 'queryKey' | 'queryFn'>
) {
    return useGetPaginatedManyTemplate<HeatmapEntry, HeatmapEntry, HeatmapResponse>(
        ['statistics', 'cleanday-heatmap', params],
        GET_CLEANDAY_GRAPH,
        'data',
        params,
        options,
        (data) => data, // No transformation needed
        {
            paramsSerializer: {
                serialize: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
            },
        }
    );
}
