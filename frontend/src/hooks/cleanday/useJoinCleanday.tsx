import { usePostTemplate } from '@hooks/templates/create/usePostTemplate';
import substituteIdToEndpoint from '@/utils/api/substituteIdToEndpoint';
import { ParticipationStatus } from '@models/deleteMeLater.ts';

// Интерфейс для запроса на присоединение к субботнику
interface JoinCleandayRequest {
  type: string;
  requirements?: number[];
}

// Константа с эндпоинтом
const JOIN_CLEANDAY_ENDPOINT = '/api/cleandays/{id}/members';

/**
 * Преобразует ParticipationStatus в строку для API
 */
function mapStatusToApiType(status: ParticipationStatus): string {
  switch (status) {
    case ParticipationStatus.GOING:
      return "Точно пойду";
    case ParticipationStatus.LATE:
      return "Опоздаю";
    case ParticipationStatus.MAYBE:
      return "Возможно пойду";
    case ParticipationStatus.NOT_GOING:
      return "Не пойду";
    default:
      return "Точно пойду";
  }
}

/**
 * Хук для добавления текущего пользователя в список участников субботника
 * @param cleandayId - ID субботника
 */
export function useJoinCleanday(cleandayId: string | number) {
  const endpoint = substituteIdToEndpoint(cleandayId, JOIN_CLEANDAY_ENDPOINT);
  
  return usePostTemplate<JoinCleandayRequest, any>(
    endpoint,
    {
      // Обработка ошибок
      onError: (error) => {
        console.error('Error joining cleanday:', error);
      }
    }
  );
}

/**
 * Подготавливает данные для API из ParticipationStatus и списка требований
 */
export function prepareJoinCleandayRequest(status: ParticipationStatus, requirements?: number[]): JoinCleandayRequest {
  return {
    type: mapStatusToApiType(status),
    requirements
  };
}