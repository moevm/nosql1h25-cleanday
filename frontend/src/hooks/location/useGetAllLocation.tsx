import {useQuery} from '@tanstack/react-query';
import axiosInstance from '@/axiosInstance';
import {GetLocationResponse} from '@api/location/models';
import {Location} from '@models/Location';
import {locationMapper} from '@utils/location/mapper';
import {GET_LOCATIONS} from '@api/location/endpoints';


interface UseGetAllLocationOptions {
    enabled?: boolean;
}

/**
 * Hook for fetching all locations from the server.
 * Makes multiple requests to bypass the pagination limit of 50 items.
 */
export const useGetAllLocation = (options?: UseGetAllLocationOptions) => {
    const { enabled = true } = options || {};

    return useQuery({
        queryKey: ['locations', 'all'],
        queryFn: async (): Promise<Location[]> => {
            // Make initial request to get first page and total count
            const initialResponse = await axiosInstance.get<GetLocationResponse>(GET_LOCATIONS, {
                params: {
                    limit: 50,
                    offset: 0,
                },
            });

            const totalCount = initialResponse.data.total_count;
            let allLocations = [...initialResponse.data.contents];

            // Calculate number of additional requests needed
            const pageSize = 50;
            const remainingCount = totalCount - pageSize;
            const additionalRequestsCount = Math.ceil(remainingCount / pageSize);

            if (additionalRequestsCount > 0) {
                // Prepare array of promises for additional requests
                const additionalRequests = Array.from({length: additionalRequestsCount},
                    (_, index) => axiosInstance.get<GetLocationResponse>(GET_LOCATIONS, {
                        params: {
                            limit: pageSize,
                            offset: pageSize * (index + 1),
                        },
                    })
                );

                // Execute all requests in parallel
                const responses = await Promise.all(additionalRequests);

                // Add results from each response to the allLocations array
                responses.forEach(response => {
                    allLocations = [...allLocations, ...response.data.contents];
                });
            }

            // Map API models to domain models
            return allLocations.map(location => locationMapper(location));
        },
        staleTime: 5 * 60 * 1000, // 5 minutes cache
        enabled: enabled,
    });
};
