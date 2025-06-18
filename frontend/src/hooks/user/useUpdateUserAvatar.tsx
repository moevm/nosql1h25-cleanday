import { usePutTemplate } from "@hooks/templates/update/usePutTemplate";
import { UPDATE_USER_AVATAR } from "@api/user/endpoints";

interface SetAvatarRequest {
  photo: string;
}

/**
 * Hook for updating user avatar
 * @param userId - The ID of the user whose avatar to update
 * @returns A mutation function for updating user avatar
 */
export const useUpdateUserAvatar = (userId: string) => {
  const url = UPDATE_USER_AVATAR.replace('{id}', userId);
  
  return usePutTemplate<SetAvatarRequest>(
    url,
    {
      onError: (error) => {
        console.error('Error updating user avatar:', error);
      }
    }
  );
};