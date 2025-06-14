import {useGetOneTemplate} from '@hooks/templates/get/useGetOneTemplate.tsx';
import {UserApiModel} from '@api/user/models';
import {User} from "@models/User.ts";
import {userMapper} from "@/utils/user/mapper.ts";
import {GET_ME} from "@api/authorization/endpoints.ts";


export function useGetMe() {
    return useGetOneTemplate<UserApiModel, User>(
        ['me'],
        GET_ME,
        undefined,
        undefined,
        userMapper
    );
}
