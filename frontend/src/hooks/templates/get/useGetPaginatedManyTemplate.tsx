import {QueryKey, useQuery, UseQueryOptions} from '@tanstack/react-query';
import {AxiosRequestConfig} from "axios";

import axiosInstance from "@/axiosInstance.ts";

import {BaseApiModel, BaseGetResponseModel} from "@api/BaseApiModel.ts";
import {BaseModel, BasePaginatedModel} from "@models/BaseModel.ts";

/**
 * Универсальный хук для GET-запросов, использующий useQuery, с поддержкой пагинации и трансформации:
 */
export function useGetPaginatedManyTemplate<
    ApiModel = BaseApiModel,
    Model = BaseModel,
    ApiResponse extends BaseGetResponseModel = BaseGetResponseModel,
>(
    queryKey: QueryKey,
    url: string,
    extractKey: keyof ApiResponse,
    params?: AxiosRequestConfig['params'],
    options?: Omit<UseQueryOptions<BasePaginatedModel<Model>>, 'queryKey' | 'queryFn'>,
    transform?: (data: ApiModel) => Model,
) {
    return useQuery<BasePaginatedModel<Model>>({
        queryKey: [...queryKey, params],
        queryFn: async () => {
            const response = await axiosInstance.get<ApiResponse>(url, {params});
            const data = response.data[extractKey] as ApiModel[];
            const totalCount = response.data.total_count;

            return {
                contents: transform ? data.map(transform) : (data as unknown as Model[]),
                totalCount,
            };
        },
        ...options,
    });
}
