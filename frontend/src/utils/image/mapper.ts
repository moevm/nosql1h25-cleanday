import { ImageApiModel } from "@api/image/models";
import { Image } from "@models/Image";

export const imageMapper = (apiModel?: ImageApiModel): Image | undefined => {
    if (!apiModel) {
        return undefined;
    }
    
    return {
        id: apiModel.key,
        description: apiModel.description,
        photo: apiModel.photo
    };
};
