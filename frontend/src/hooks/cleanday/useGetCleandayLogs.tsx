import {UseQueryOptions} from '@tanstack/react-query';
import {useGetPaginatedManyTemplate} from "@hooks/templates/get/useGetPaginatedManyTemplate.tsx";
import {CleandayLogApiModel, GetCleandayLogsParams, GetCleandayLogsResponse} from "@api/cleanday/models.ts";
import {CleandayLog} from "@models/Cleanday.ts";
import {cleandayLogMapper} from "@utils/cleanday/mapper.ts";
import {BasePaginatedModel} from "@models/BaseModel.ts";
import substituteIdToEndpoint from "@utils/api/substituteIdToEndpoint.ts";
import {GET_CLEANDAY_LOGS} from "@api/cleanday/endpoints.ts";

export function useGetCleandayLogs(
    cleandayId: string,
    params: GetCleandayLogsParams,
    options?: Omit<UseQueryOptions<BasePaginatedModel<CleandayLog>>, 'queryKey' | 'queryFn'>
) {
    return useGetPaginatedManyTemplate<
        CleandayLogApiModel,
        CleandayLog,
        GetCleandayLogsResponse
    >(
        ['cleandayLogs', cleandayId],
        substituteIdToEndpoint(cleandayId, GET_CLEANDAY_LOGS),
        'logs',
        params,
        options,
        cleandayLogMapper
    );
}
