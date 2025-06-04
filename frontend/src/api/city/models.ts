import {BaseApiModel, BaseGetResponseModel} from "@api/BaseApiModel";

export interface CityApiModel extends BaseApiModel {
    name: string;
}

export interface GetCitiesResponse extends BaseGetResponseModel {
    contents: Array<CityApiModel>;
}
