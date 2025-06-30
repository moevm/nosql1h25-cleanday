import { UseQueryOptions } from '@tanstack/react-query';
import { GET_EXPORT } from '@api/statistics/endpoints.ts';
import { useGetOneTemplate } from '@hooks/templates/get/useGetOneTemplate.tsx';

/**
 * Хук для экспорта базы данных в виде ZIP-файла
 * @returns Query для скачивания ZIP-файла
 */
export function useExportStatistics(
    options?: Omit<UseQueryOptions<Blob>, 'queryKey' | 'queryFn'>
) {
    return useGetOneTemplate<Blob, Blob>(
        ['statistics', 'export'],
        GET_EXPORT,
        undefined,
        {
            ...options,
            enabled: false, // Запрос не будет выполняться автоматически
            cacheTime: 0, // Не кешировать ответ
            retry: 0, // Не повторять запрос при ошибке
        },
        (data) => data // Не трансформируем данные, так как это бинарный файл
    );
}
