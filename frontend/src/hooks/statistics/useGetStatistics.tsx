import { UseQueryOptions } from '@tanstack/react-query';

import { useGetOneTemplate } from '@hooks/templates/get/useGetOneTemplate.tsx';
import { GET_STATISTICS } from '@api/statistics/endpoints.ts';
import { StatisticsApiModel } from '@api/statistics/models.ts';
import { Statistics } from '@models/Statistics.ts';
import { statisticsMapper } from '@utils/statistics/mapper.ts';

/**
 * Хук для получения статистики приложения
 */
export function useGetStatistics(
    options?: Omit<UseQueryOptions<Statistics>, 'queryKey' | 'queryFn'>
) {
    return useGetOneTemplate<StatisticsApiModel, Statistics>(
        ['statistics'],
        GET_STATISTICS,
        undefined,
        options,
        statisticsMapper
    );
}
