import {BaseApiModel, BaseGetResponseModel} from "@api/BaseApiModel";


export interface UserApiModel extends BaseApiModel {
    first_name: string;
    last_name: string;
    login: string;
    sex: string;
    city: string;
    about_me: string;
    score: number;
    level: number;
    cleanday_count: number;
    organized_count: number;
    stat: number;
    created_at?: string;
    updated_at?: string;
}

export interface GetUsersResponse extends BaseGetResponseModel {
    users: Array<UserApiModel>;
}

export interface UpdateUserApiModel {
    first_name?: string;
    last_name?: string;
    sex?: string;
    city_id?: string;
    about_me?: string;
    password?: string;
}

export interface UpdateUserApiModelWithKey extends BaseApiModel, UpdateUserApiModel {

}
