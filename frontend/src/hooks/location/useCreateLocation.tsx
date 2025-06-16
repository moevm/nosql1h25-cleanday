import { useQueryClient } from '@tanstack/react-query';
import { usePostTemplate } from '@hooks/templates/create/usePostTemplate';
import { CreateLocationApiModel, LocationApiModel } from '@api/location/models';
import { Location } from '@models/Location';
import { CREATE_LOCATION } from '@api/location/endpoints';
import { locationMapper } from '@utils/location/mapper';

export const useCreateLocation = () => {
    const queryClient = useQueryClient();
    
    return usePostTemplate<CreateLocationApiModel, LocationApiModel, Location>(
        CREATE_LOCATION,
        {
            onSuccess: () => {
                // Invalidate locations queries to trigger refetch after successful creation
                queryClient.invalidateQueries({queryKey: ['locations']}).then();
            },
        },
        locationMapper
    );
};
