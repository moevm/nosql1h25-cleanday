import { BaseApiModel, BaseGetResponseModel } from "@api/BaseApiModel";

export interface ImageApiModel extends BaseApiModel {
    description: string;
    photo: string;
}

export interface GetImagesResponse extends BaseGetResponseModel {
    contents: ImageApiModel[];
}

export interface CreateImageApiModel {
    description: string;
    photo: string;
}

export interface CreateImagesApiModel {
    images: CreateImageApiModel[];
}
