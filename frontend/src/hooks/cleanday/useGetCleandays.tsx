import {useGetPaginatedManyTemplate} from "@hooks/templates/get/useGetPaginatedManyTemplate.tsx";
import {CleandayApiModel, GetCleandayParams, GetCleandayResponse} from "@api/cleanday/models.ts";
import {Cleanday} from "@models/Cleanday.ts";
import {GET_CLEANDAYS} from "@api/cleanday/endpoints.ts";
import {cleandayMapper} from "@utils/cleanday/mapper.ts";
import qs from "qs";


export const useGetCleandays = (params: GetCleandayParams) => {
    return useGetPaginatedManyTemplate<CleandayApiModel, Cleanday, GetCleandayResponse>(
        ['cleandays'],
        GET_CLEANDAYS,
        'cleandays',
        params,
        {
            staleTime: 5 * 60 * 1000,
        },
        cleandayMapper,
        {
            paramsSerializer: {
                serialize: (params) => qs.stringify(params, {arrayFormat: 'repeat'}),
            },
        }
    );
}
