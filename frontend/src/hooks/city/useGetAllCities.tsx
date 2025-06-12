import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/axiosInstance';
import { City } from '@models/City';
import { cityMapper } from '@utils/city/mapper';
import { GET_CITIES } from '@api/city/endpoints';

interface GetCitiesResponse {
  contents: any[];
  total_count: number;
}

/**
 * Hook for fetching all cities from the server.
 * Makes multiple requests to bypass the pagination limit of 50 items.
 */
export const useGetAllCities = () => {
  return useQuery({
    queryKey: ['cities', 'all'],
    queryFn: async (): Promise<City[]> => {
      // Make initial request to get first page and total count
      const initialResponse = await axiosInstance.get<GetCitiesResponse>(GET_CITIES, {
        params: {
          limit: 50,
          offset: 0,
        },
      });
      
      const totalCount = initialResponse.data.total_count;
      let allCities = [...initialResponse.data.contents];
      
      // Calculate number of additional requests needed
      const pageSize = 50;
      const remainingCount = totalCount - pageSize;
      const additionalRequestsCount = Math.ceil(remainingCount / pageSize);
      
      if (additionalRequestsCount > 0) {
        // Prepare array of promises for additional requests
        const additionalRequests = Array.from({ length: additionalRequestsCount }, 
          (_, index) => axiosInstance.get<GetCitiesResponse>(GET_CITIES, {
            params: {
              limit: pageSize,
              offset: pageSize * (index + 1),
            },
          })
        );
        
        // Execute all requests in parallel
        const responses = await Promise.all(additionalRequests);
        
        // Add results from each response to the allCities array
        responses.forEach(response => {
          allCities = [...allCities, ...response.data.contents];
        });
      }
      
      // Map API models to domain models
      return allCities.map(city => cityMapper(city));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
};
