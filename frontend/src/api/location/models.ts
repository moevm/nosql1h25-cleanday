import {BaseApiModel} from "@api/BaseApiModel";

import {CityApiModel} from "@api/city/models";


export interface LocationApiModel extends BaseApiModel {
    address: string;
    instructions: string;
    city: CityApiModel;
}
