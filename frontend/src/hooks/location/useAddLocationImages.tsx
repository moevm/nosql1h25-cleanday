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
            
            console.log('Adding images to location:', locationId);
            console.log('Number of files:', files.length);
            
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
            console.log('POST request to:', url);
            
            try {
                // Call the API directly with the URL and processed data
                const response = await axiosInstance.post<number>(url, { images });
                console.log('Response status:', response.status);
                return response.data;
            } catch (error: any) {
                console.error('Error uploading images:', error.response ? error.response.data : error.message);
                throw error;
            }
        },
        onSuccess: (data, variables) => {
            console.log('Successfully uploaded images:', data);
            // Invalidate queries to refetch the images
            queryClient.invalidateQueries({ queryKey: ['locationImages', variables.locationId] });
        },
        onError: (error) => {
            console.error('Error in mutation:', error);
        }
    });
};