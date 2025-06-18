import { usePatchTemplate } from "@hooks/templates/update/usePatchTemplate";
import { UPDATE_USER } from "@api/user/endpoints";
import { UserProfileEdit } from "@models/deleteMeLater";

/**
 * Hook for updating user information
 * @param userId - The ID of the user to update
 * @returns A mutation function for updating user info
 */
export const useUpdateUserInfo = (userId: string) => {
  const url = UPDATE_USER.replace('{id}', userId);
  
  return usePatchTemplate<UserProfileEdit>(
    url,
    {
      onError: (error) => {
        console.error('Error updating user information:', error);
      }
    }
  );
};
