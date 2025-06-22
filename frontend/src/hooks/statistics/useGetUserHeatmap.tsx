import { UseQueryOptions } from '@tanstack/react-query';
import qs from 'qs';

import { useGetPaginatedManyTemplate } from '@hooks/templates/get/useGetPaginatedManyTemplate.tsx';
import { GET_USERS_GRAPH } from '@api/statistics/endpoints.ts';
import { HeatmapEntry, HeatmapResponse, UserHeatmapParams } from '@api/statistics/models.ts';
import { BasePaginatedModel } from '@models/BaseModel.ts';

/**
 * Hook for fetching user heatmap data
 * @param params - Query parameters for the heatmap
 * @param options - Additional query options
 * @returns Query result with heatmap data
 */
export function useGetUserHeatmap(
    params: UserHeatmapParams,
    options?: Omit<UseQueryOptions<BasePaginatedModel<HeatmapEntry>>, 'queryKey' | 'queryFn'>
) {
    return useGetPaginatedManyTemplate<HeatmapEntry, HeatmapEntry, HeatmapResponse>(
        ['statistics', 'user-heatmap', params],
        GET_USERS_GRAPH,
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
