import {GetUsersParams, GetUsersResponse, UserApiModel} from '@api/user/models';
import {GET_USERS} from '@api/user/endpoints.ts';
import {User} from "@models/User.ts";
import {userMapper} from "@/utils/user/mapper.ts";
import {useGetPaginatedManyTemplate} from "@hooks/templates/get/useGetPaginatedManyTemplate.tsx";


export const useGetUsers = (params: GetUsersParams) => {
    return useGetPaginatedManyTemplate<UserApiModel, User, GetUsersResponse>(
        ['users'],
        GET_USERS,
        'users',
        params,
        {staleTime: 5 * 60 * 1000},
        userMapper
    );
}
