import {UseQueryOptions} from '@tanstack/react-query';
import {useGetPaginatedManyTemplate} from "@hooks/templates/get/useGetPaginatedManyTemplate.tsx";
import {CommentApiModel, GetCommentsResponse} from "@api/cleanday/models.ts";
import {Comment} from "@models/Comment.ts";
import {commentMapper} from "@utils/cleanday/mapper.ts";
import {BasePaginatedModel} from "@models/BaseModel.ts";
import substituteIdToEndpoint from "@utils/api/substituteIdToEndpoint.ts";
import {GET_CLEANDAY_COMMENTS} from "@api/cleanday/endpoints.ts";
import {BaseGetParamsModel} from "@api/BaseApiModel.ts";

export function useGetCleandayComments(
    cleandayId: string,
    params: BaseGetParamsModel,
    options?: Omit<UseQueryOptions<BasePaginatedModel<Comment>>, 'queryKey' | 'queryFn'>
) {
    return useGetPaginatedManyTemplate<
        CommentApiModel,
        Comment,
        GetCommentsResponse
    >(
        ['cleandayComments', cleandayId],
        substituteIdToEndpoint(cleandayId, GET_CLEANDAY_COMMENTS),
        'comments',
        params,
        options,
        commentMapper
    );
}