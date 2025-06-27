import { useGetOneTemplate } from '@hooks/templates/get/useGetOneTemplate';
import { GetImagesResponse } from '@api/image/models';
import { GET_LOCATION_IMAGES } from '@api/location/endpoints';
import { Image } from '@models/Image';
import { imageMapper } from '@utils/image/mapper';
import substituteIdToEndpoint from '@utils/api/substituteIdToEndpoint';

export const useGetLocationImages = (locationId: string) => {
    return useGetOneTemplate<GetImagesResponse, Image[]>(
        ['locationImages', locationId],
        locationId ? substituteIdToEndpoint(locationId, GET_LOCATION_IMAGES) : '',
        undefined, // no params
        { enabled: !!locationId },
        (data) => data.contents.map(imageMapper).filter(Boolean) as Image[]
    );
};