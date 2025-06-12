import { useQueryClient } from '@tanstack/react-query';
import { usePostTemplate } from '@hooks/templates/create/usePostTemplate';
import { CreateCleandayApiModel, CleandayApiModel } from '@api/cleanday/models';
import { Cleanday } from '@models/Cleanday';
import { CREATE_CLEANDAY } from '@api/cleanday/endpoints';
import { cleandayMapper } from '@utils/cleanday/mapper';

export const useCreateCleanday = () => {
    const queryClient = useQueryClient();
    
    return usePostTemplate<CreateCleandayApiModel, CleandayApiModel, Cleanday>(
        CREATE_CLEANDAY,
        {
            onSuccess: async () => {
                try {
                    // First invalidate the cache to mark it as stale
                    await queryClient.invalidateQueries({ queryKey: ['cleandays'] });
                    
                    // Then force a refetch to update the UI immediately
                    await queryClient.refetchQueries({ 
                        queryKey: ['cleandays'],
                        type: 'active' // Only refetch active queries that are currently rendered
                    });
                    
                    console.log("Cleandays cache successfully invalidated and refetched");
                } catch (error) {
                    console.error("Failed to refresh cleandays cache:", error);
                }
            },
        },
        cleandayMapper
    );
};
