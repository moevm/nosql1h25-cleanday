import {BaseApiModel, BaseGetResponseModel} from "@api/BaseApiModel";

import {CityApiModel} from "@api/city/models";


export interface LocationApiModel extends BaseApiModel {
    address: string;
    instructions: string;
    city: CityApiModel;
}

export interface GetLocationResponse extends BaseGetResponseModel {
    contents: LocationApiModel[];
}

export interface CreateLocationApiModel {
    address: string;
    instructions: string;
    city_key: string;
}
