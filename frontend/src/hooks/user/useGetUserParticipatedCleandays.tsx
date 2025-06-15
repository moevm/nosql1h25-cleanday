import {useGetPaginatedManyTemplate} from '@hooks/templates/get/useGetPaginatedManyTemplate.tsx';
import {CleandayApiModel, GetCleandayResponse} from '@api/cleanday/models';
import {GET_USER_CLEANDAYS} from '@api/user/endpoints.ts';
import substituteIdToEndpoint from '@/utils/api/substituteIdToEndpoint.ts';
import {Cleanday} from "@models/Cleanday.ts";
import {cleandayMapper} from "@/utils/cleanday/mapper.ts";

export function useGetUserParticipatedCleandays(userId: string) {
    return useGetPaginatedManyTemplate<CleandayApiModel, Cleanday, GetCleandayResponse>(
        ['user', userId, 'cleandays'],
        substituteIdToEndpoint(userId, GET_USER_CLEANDAYS),
        'cleandays',
        undefined,
        {staleTime: 5 * 60 * 1000},
        cleandayMapper
    );
}