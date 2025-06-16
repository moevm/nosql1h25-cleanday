import {useGetOneTemplate} from '@hooks/templates/get/useGetOneTemplate.tsx';
import substituteIdToEndpoint from '@/utils/api/substituteIdToEndpoint.ts';
import {CleandayApiModel} from "@api/cleanday/models.ts";
import {Cleanday} from "@models/Cleanday.ts";
import {GET_CLEANDAY} from "@api/cleanday/endpoints.ts";
import {cleandayMapper} from "@utils/cleanday/mapper.ts";


export function useGetCleandayById(id: string) {
    return useGetOneTemplate<CleandayApiModel, Cleanday>(
        ['cleanday', id],
        substituteIdToEndpoint(id, GET_CLEANDAY),
        undefined,
        undefined,
        cleandayMapper
    );
}
