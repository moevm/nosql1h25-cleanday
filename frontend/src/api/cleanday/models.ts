import {BaseApiModel, BaseGetResponseModel} from "@api/BaseApiModel";

import {CityApiModel} from "@api/city/models";
import {LocationApiModel} from "@api/location/models";


export interface RequirementApiModel extends BaseApiModel {
    name: string;
    users_amount: number;
}

export interface CleandayApiModel extends BaseApiModel {
    name: string;
    description: string;
    participant_count: number;
    recommended_count: number;
    city: CityApiModel;
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
    requirements: Array<RequirementApiModel>;
    results: Array<string>;
}

export interface GetCleandaysResponse extends BaseGetResponseModel {
    cleandays: Array<CleandayApiModel>;
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
    requirements: Array<RequirementApiModel>;
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
}

export interface UpdateCleandayApiModelWithKey extends UpdateCleandayApiModel, BaseApiModel {

}
