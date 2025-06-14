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
            onSuccess: () => {
                // Invalidate cleandays queries to trigger refetch after successful creation
                queryClient.invalidateQueries({ queryKey: ['cleandays'] }).then();
            },
        },
        cleandayMapper
    );
};
