import {UseQueryOptions} from '@tanstack/react-query';
import {useGetPaginatedManyTemplate} from "@hooks/templates/get/useGetPaginatedManyTemplate.tsx";
import {BasePaginatedModel} from "@models/BaseModel.ts";
import substituteIdToEndpoint from "@utils/api/substituteIdToEndpoint.ts";
import {GET_CLEANDAY_MEMBERS} from "@api/cleanday/endpoints.ts";
import {BaseGetParamsModel} from "@api/BaseApiModel.ts";
import {CleandayParticipant} from "@components/dialog/CleandayParticipantsDialog";

// Define API response types
interface GetCleandayMembersResponse {
  users: CleandayMemberApiModel[];
  total_count: number;
}

interface CleandayMemberApiModel {
  key: string;
  first_name: string;
  last_name: string;
  login: string;
  participation_type: string;
  // Add any other properties from API response
}

/**
 * Maps API response data to frontend CleandayParticipant model
 */
function cleandayMemberMapper(apiMember: CleandayMemberApiModel): CleandayParticipant {
  return {
    id: apiMember.key,
    firstName: apiMember.first_name,
    lastName: apiMember.last_name,
    login: apiMember.login,
    status: apiMember.participation_type
  };
}

/**
 * Hook for fetching members/participants of a specific cleanday
 * 
 * @param cleandayId - ID of the cleanday
 * @param params - Query parameters for pagination and filtering
 * @param options - Additional react-query options
 * @returns Query result with cleanday members data
 */
export function useGetCleandayMembers(
    cleandayId: string,
    params: BaseGetParamsModel,
    options?: Omit<UseQueryOptions<BasePaginatedModel<CleandayParticipant>>, 'queryKey' | 'queryFn'>
) {
    return useGetPaginatedManyTemplate<
        CleandayMemberApiModel,
        CleandayParticipant,
        GetCleandayMembersResponse
    >(
        ['cleandayMembers', cleandayId],
        substituteIdToEndpoint(cleandayId, GET_CLEANDAY_MEMBERS),
        'users',
        params,
        options,
        cleandayMemberMapper
    );
}