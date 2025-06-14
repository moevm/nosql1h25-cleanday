import {CityApiModel} from "@api/city/models";
import {City} from "@models/City";

export const cityMapper = (apiModel?: CityApiModel): City | undefined => {
    if (!apiModel) {
        return undefined;
    }
    
    return {
        id: apiModel.key,
        name: apiModel.name,
    };
};
