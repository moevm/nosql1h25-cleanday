import {BaseApiModel, BaseGetParamsModel} from "@api/BaseApiModel";

export enum Sex {
    male = "male",
    female = "female",
    other = "other",
}


export interface UserApiModel extends BaseApiModel {
    first_name: string;
    last_name: string;
    login: string;
    sex: Sex;
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

export interface GetUsersParams extends BaseGetParamsModel {
    sort_by?: string;
    first_name?: string;
    last_name?: string;
    login?: string;
    sex?: Sex;
    city?: string;
    level_from?: string;
    level_to?: string;
    cleandays_from?: string;
    cleandays_to?: string;
    organized_from?: string;
    organized_to?: string;
    stat_from?: string;
    stat_to?: string;
}

export interface UpdateUserApiModel {
    first_name?: string;
    last_name?: string;
    sex?: Sex;
    city_id?: string;
    about_me?: string;
    password?: string;
}

export interface UpdateUserApiModelWithKey extends BaseApiModel, UpdateUserApiModel {

}
