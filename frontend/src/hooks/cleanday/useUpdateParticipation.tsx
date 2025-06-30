import { useMutation } from '@tanstack/react-query';
import axiosInstance from '@/axiosInstance.ts';
import substituteIdToEndpoint from '@/utils/api/substituteIdToEndpoint';
import { ParticipationStatus } from '@models/deleteMeLater.ts';
import { UPDATE_PARTICIPATION } from '@api/cleanday/endpoints';

// Интерфейс для запроса на обновление участия
interface UpdateParticipationRequest {
  type?: string;
  requirement_keys?: string[];
}

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
 * Хук для обновления участия пользователя в субботнике
 * @param cleandayId - ID субботника
 */
export function useUpdateParticipation(cleandayId: string | number) {
  const endpoint = substituteIdToEndpoint(cleandayId, UPDATE_PARTICIPATION);
  
  return useMutation({
    mutationFn: async (data: UpdateParticipationRequest) => {
      const response = await axiosInstance.patch(endpoint, data);
      return response.data;
    },
    onError: (error) => {
      console.error('Error updating participation:', error);
    }
  });
}

/**
 * Подготавливает данные для API из ParticipationStatus и списка требований
 */
export function prepareUpdateParticipationRequest(
  status?: ParticipationStatus, 
  requirementIds?: number[]
): UpdateParticipationRequest {
  const request: UpdateParticipationRequest = {};
  
  if (status) {
    request.type = mapStatusToApiType(status);
  }
  
  if (requirementIds && requirementIds.length > 0) {
    request.requirement_keys = requirementIds.map(id => id.toString());
  }
  
  return request;
}