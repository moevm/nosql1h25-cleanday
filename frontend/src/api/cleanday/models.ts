import {BaseApiModel, BaseGetParamsModel, BaseGetResponseModel} from "@api/BaseApiModel";
import {LocationApiModel} from "@api/location/models";
import {UserApiModel} from "@api/user/models";
import {Requirement} from "@models/Cleanday.ts";

export interface RequirementApiModel extends BaseApiModel {
    name: string;
    users_amount: number;
}

export interface CreateRequirementApiModel {
    name: string;
}

export interface CleandayApiModel extends BaseApiModel {
    name: string;
    description: string;
    participant_count: number;
    recommended_count: number;
    city: string;
    location: LocationApiModel;
    begin_date: string;
    end_date: string;
    created_at: string;
    updated_at: string;
    organization: string;
    organizer: string;
    organizer_key: string;
    area: number;
    status: string;
    tags: Array<string>;
    requirements: Array<RequirementApiModel> | null;
    results: Array<string> | null;
}

export interface GetCleandayResponse extends BaseGetResponseModel {
    cleandays: CleandayApiModel[];
}

export interface GetCleandayParams extends BaseGetParamsModel {
    name?: string;
    organization?: string;
    organizer?: string;
    city?: string;
    address?: string;
    status?: string[];
    begin_date_from?: string;
    begin_date_to?: string;
    end_date_from?: string;
    end_date_to?: string;
    created_at_from?: string;
    created_at_to?: string;
    updated_at_from?: string;
    updated_at_to?: string;
    area_from?: number;
    area_to?: number;
    recommended_count_from?: number;
    recommended_count_to?: number;
    participant_count_from?: number;
    participant_count_to?: number;
    tags?: string[];
}

export interface CreateCleandayApiModel {
    name: string;
    location_id: string;
    begin_date: string;
    end_date: string;
    organization: string;
    area: number;
    description: string;
    recommended_count: number;
    tags: Array<string>;
    requirements: Array<CreateRequirementApiModel>;
}

export interface UpdateCleandayApiModel {
    name?: string;
    location_id?: string;
    begin_date?: string;
    end_date?: string;
    organization?: string;
    area?: number;
    description?: string;
    recommended_count?: number;
    tags?: Array<string>;
    status?: string;
    requirements: Array<RequirementApiModel>;
}

export interface UpdateCleandayApiModelWithKey extends UpdateCleandayApiModel, BaseApiModel {

}

export interface CommentApiModel extends BaseApiModel {
    text: string;
    date: string;
    author?: UserApiModel;
}

export interface CleandayLogApiModel extends BaseApiModel {
    date: string;
    type: string;
    description: string;
    user?: UserApiModel;
    comment?: CommentApiModel;
    location?: LocationApiModel;
}

export interface GetCleandayLogsParams extends BaseGetParamsModel {
    type?: string;
    description?: string;
    user_login?: string;
    location_address?: string;
    comment_text?: string;
    date_from?: string;
    date_to?: string;
}

export interface GetCleandayLogsResponse extends BaseGetResponseModel {
    logs: CleandayLogApiModel[];
}
