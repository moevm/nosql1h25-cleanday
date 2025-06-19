import { useGetOneTemplate } from '@hooks/templates/get/useGetOneTemplate.tsx';
import { GET_USER_AVATAR } from '@api/user/endpoints.ts';
import substituteIdToEndpoint from '@/utils/api/substituteIdToEndpoint.ts';

interface UserAvatarResponse {
  photo: string;
}

/**
 * Hook for fetching a user's avatar
 * @param userId - The ID of the user whose avatar to fetch
 * @returns The query result containing the user's avatar as a base64 string
 */
export function useGetUserAvatar(userId: string) {
  return useGetOneTemplate<UserAvatarResponse, UserAvatarResponse>(
    ['user', userId, 'avatar'],
    substituteIdToEndpoint(userId, GET_USER_AVATAR),
    undefined,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes cache
      enabled: !!userId
    }
  );
}
