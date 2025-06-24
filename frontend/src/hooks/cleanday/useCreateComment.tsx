import {useQueryClient} from '@tanstack/react-query';
import {useMutation} from '@tanstack/react-query';
import {Comment} from '@models/Comment';
import {CommentApiModel} from '@api/cleanday/models';
import {commentMapper} from '@utils/cleanday/mapper';
import {CREATE_CLEANDAY_COMMENT} from '@api/cleanday/endpoints';
import substituteIdToEndpoint from "@utils/api/substituteIdToEndpoint.ts";
import axiosInstance from "@/axiosInstance.ts";
import {AxiosRequestConfig} from "axios";

export const useCreateComment = (cleandayId: string) => {
    const queryClient = useQueryClient();

    return useMutation<Comment, CommentApiModel, string>({
        mutationFn: async (commentText: string) => {
            const config: AxiosRequestConfig = {
                params: {
                    comment: commentText
                }
            };

            const response = await axiosInstance.post<CommentApiModel>(
                substituteIdToEndpoint(cleandayId, CREATE_CLEANDAY_COMMENT),
                {}, // Empty body
                config
            );
            console.log("POST to:", substituteIdToEndpoint(cleandayId, CREATE_CLEANDAY_COMMENT));

            return commentMapper(response.data);
        },
        onSuccess: () => {
            // Инвалидируем именно тот ключ, который используется в useGetCleandayComments
            queryClient.invalidateQueries({queryKey: ['cleandayComments', cleandayId]}).then();
        },
        onError: (error) => {
            console.error("Ошибка при создании комментария:", error);
        }
    });
};