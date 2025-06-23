import {useQueryClient} from '@tanstack/react-query';
import {usePostTemplate} from '@hooks/templates/create/usePostTemplate';
import {Comment} from '@models/Comment';
import {CommentApiModel, CreateCommentApiModel} from '@api/cleanday/models';
import {commentMapper} from '@utils/cleanday/mapper';
import {CREATE_CLEANDAY_COMMENT} from '@api/cleanday/endpoints';

/**
 * Хук для создания нового комментария к субботнику.
 *
 * @param cleandayId - ID субботника, к которому добавляется комментарий
 * @returns - Мутация для создания комментария
 */
export const useCreateComment = (cleandayId: string) => {
    const queryClient = useQueryClient();
    const endpoint = CREATE_CLEANDAY_COMMENT.replace('{id}', cleandayId);

    return usePostTemplate<string, CommentApiModel, Comment>(
        endpoint,
        {
            onSuccess: () => {
                // Инвалидируем именно тот ключ, который используется в useGetCleandayComments
                queryClient.invalidateQueries({queryKey: ['cleandayComments', cleandayId]}).then();
            },
            onError: (error) => {
                console.error("Ошибка при создании комментария:", error);
            }
        },
        commentMapper,
        {
            transformRequest: [(commentText: string) => {
                const data: CreateCommentApiModel = {
                    text: commentText,
                    date: new Date().toISOString()
                };
                return JSON.stringify(data);
            }]
        }
    );
};