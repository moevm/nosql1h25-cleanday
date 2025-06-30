import {UseQueryOptions} from '@tanstack/react-query';
import {useGetPaginatedManyTemplate} from "@hooks/templates/get/useGetPaginatedManyTemplate.tsx";
import {BasePaginatedModel} from "@models/BaseModel.ts";
import substituteIdToEndpoint from "@utils/api/substituteIdToEndpoint.ts";
import {GET_CLEANDAY_MEMBERS} from "@api/cleanday/endpoints.ts";
import {BaseGetParamsModel} from "@api/BaseApiModel.ts";
import {CleandayParticipant} from "@components/dialog/CleandayParticipantsDialog";
import {GetUsersResponse} from "@api/user/models.ts";
import {CleandayMemberApiModel} from "@api/cleanday/models.ts";
import {cleandayMemberMapper} from "@utils/cleanday/mapper.ts";




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
        GetUsersResponse
    >(
        ['cleandayMembers', cleandayId],
        substituteIdToEndpoint(cleandayId, GET_CLEANDAY_MEMBERS),
        'users',
        params,
        options,
        cleandayMemberMapper
    );
}