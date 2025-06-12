import {CityApiModel} from "@api/city/models";
import {City} from "@models/City";

export const cityMapper = (apiModel: CityApiModel): City => ({
    id: apiModel.key,
    name: apiModel.name,
});
