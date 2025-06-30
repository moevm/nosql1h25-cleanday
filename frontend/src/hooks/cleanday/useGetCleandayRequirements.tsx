import { useGetPaginatedManyTemplate } from '@hooks/templates/get/useGetPaginatedManyTemplate';
import substituteIdToEndpoint from '@/utils/api/substituteIdToEndpoint';
import { Requirement } from '@models/deleteMeLater.ts';

// Интерфейс для API-модели требования
export interface RequirementApiModel {
  id: number;
  name: string;
  // Можно добавить другие поля, если они есть в API
}

// Константа с эндпоинтом
const GET_CLEANDAY_REQUIREMENTS = '/api/cleandays/{id}/requirements';

/**
 * Хук для получения списка требований/условий субботника
 * @param cleandayId - ID субботника
 * @param params - Параметры запроса (пагинация, сортировка)
 */
export function useGetCleandayRequirements(cleandayId: string | number, params?: Record<string, unknown>) {
  const endpoint = substituteIdToEndpoint(cleandayId, GET_CLEANDAY_REQUIREMENTS);
  
  return useGetPaginatedManyTemplate<
    RequirementApiModel,
    Requirement
  >(
    ['cleanday', cleandayId, 'requirements'],
    endpoint,
    'contents',
    params,
    {
      // При ошибке не показываем уведомление
      onError: (error) => {
        console.error('Error fetching cleanday requirements:', error);
      }
    },
    // Функция трансформации API-модели в модель приложения
    (apiModel: RequirementApiModel): Requirement => ({
      id: apiModel.id,
      name: apiModel.name,
    })
  );
}