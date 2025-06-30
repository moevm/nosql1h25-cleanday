import { UseMutationOptions } from '@tanstack/react-query';
import { POST_IMPORT } from '@api/statistics/endpoints.ts';
import { usePostTemplate } from '@hooks/templates/create/usePostTemplate.tsx';

/**
 * Интерфейс ответа API при импорте данных
 */
interface ImportResponse {
    message: string;
}

/**
 * Хук для импорта базы данных из ZIP-файла
 * @returns Mutation для загрузки ZIP-файла
 */
export function useImportStatistics(
    options?: Omit<UseMutationOptions<ImportResponse, unknown, FormData>, 'mutationFn'>
) {
    return usePostTemplate<FormData, ImportResponse, ImportResponse>(
        POST_IMPORT,
        options,
        (data) => data, // Не трансформируем данные
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );
}
