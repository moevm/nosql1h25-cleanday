import { useGetOneTemplate } from '@hooks/templates/get/useGetOneTemplate.tsx';
import substituteIdToEndpoint from '@/utils/api/substituteIdToEndpoint.ts';
import { GET_CLEANDAY_IMAGES } from '@api/cleanday/endpoints.ts';
import { Image } from '@models/Image.ts';

interface ImageListResponse {
  contents: Array<{
    key: string;
    description: string;
    photo: string;
  }>;
}

export function useGetCleandayImages(cleandayId: string) {
  return useGetOneTemplate<ImageListResponse, { contents: Image[] }>(
    ['cleanday', cleandayId, 'images'],
    substituteIdToEndpoint(cleandayId, GET_CLEANDAY_IMAGES),
    undefined,
    { enabled: !!cleandayId },
    (response) => {
      // Map the response to ensure image data is properly structured
      const processedContents = response.contents.map(img => ({
        ...img,
        // Ensure we're not adding duplicate data:image prefixes
        photo: img.photo.startsWith('data:image') 
          ? img.photo 
          : `data:image/jpeg;base64,${img.photo}`
      }));
      
      return { contents: processedContents };
    }
  );
}