import {useGetOneTemplate} from '@hooks/templates/get/useGetOneTemplate.tsx';
import {UserApiModel} from '@api/user/models';
import {GET_USER} from '@api/user/endpoints.ts';
import substituteIdToEndpoint from '@/utils/api/substituteIdToEndpoint.ts';
import {User} from "@models/User.ts";
import {userMapper} from "@/utils/user/mapper.ts";


export function useGetUserById(id: string) {
    return useGetOneTemplate<UserApiModel, User>(
        ['user', id],
        substituteIdToEndpoint(id, GET_USER),
        undefined,
        undefined,
        userMapper
    );
}
