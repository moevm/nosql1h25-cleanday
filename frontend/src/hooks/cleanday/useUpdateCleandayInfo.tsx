import {usePatchTemplate} from "@hooks/templates/update/usePatchTemplate";
import {UPDATE_CLEANDAY} from "@api/cleanday/endpoints";
import substituteIdToEndpoint from "@utils/api/substituteIdToEndpoint";
import {UpdateCleandayApiModel} from "@api/cleanday/models.ts";

/**
 * Hook for updating user information
 * @param cleandayId - The ID of the user to update
 * @returns A mutation function for updating user info
 */
export const useUpdateCleandayInfo = (cleandayId: string) => {
    const url = substituteIdToEndpoint(cleandayId, UPDATE_CLEANDAY);

    return usePatchTemplate<UpdateCleandayApiModel>(
        url,
        {
            onError: (error) => {
                console.error('Error updating cleanday information:', error);
            }
        }
    );
};
