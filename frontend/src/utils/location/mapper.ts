import {LocationApiModel} from "@api/location/models.ts";
import {Location} from "@models/Location.ts";
import {cityMapper} from "@utils/city/mapper.ts";


export const locationMapper = (apiModel?: LocationApiModel): Location | undefined => {
    if (!apiModel) {
        return undefined;
    }
    
    return {
        id: apiModel.key,
        address: apiModel.address,
        instructions: apiModel.instructions,
        city: apiModel.city ? cityMapper(apiModel.city) : undefined,
    };
};
