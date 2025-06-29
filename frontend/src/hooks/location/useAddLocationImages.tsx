import { useQueryClient } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { CreateImagesApiModel } from '@api/image/models';
import { CREATE_LOCATION_IMAGES } from '@api/location/endpoints';
import { fileToBase64 } from '@utils/files/fileToBase64';
import substituteIdToEndpoint from '@utils/api/substituteIdToEndpoint';
import axiosInstance from "@/axiosInstance.ts";

interface AddLocationImagesProps {
    locationId: string;
    files: File[];
    descriptions?: string[];
}

export const useAddLocationImages = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ locationId, files, descriptions = [] }: AddLocationImagesProps) => {
            if (!locationId || files.length === 0) {
                throw new Error('Location ID and files are required');
            }
            
            // Process files to base64
            const images = await Promise.all(
                files.map(async (file, index) => {
                    const base64 = await fileToBase64(file);
                    return {
                        photo: base64,
                        description: descriptions[index] || file.name
                    };
                })
            );
            
            // Set the URL with the locationId
            const url = substituteIdToEndpoint(locationId, CREATE_LOCATION_IMAGES);
            
            try {
                // Call the API directly with the URL and processed data
                const response = await axiosInstance.post<number>(url, { images });
                return response.data;
            } catch (error: any) {
                throw error;
            }
        },
        onSuccess: (data, variables) => {
            // Invalidate queries to refetch the images
            queryClient.invalidateQueries({ queryKey: ['locationImages', variables.locationId] });
        }
    });
};