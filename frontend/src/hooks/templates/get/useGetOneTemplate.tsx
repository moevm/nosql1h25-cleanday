import {QueryKey, useQuery, UseQueryOptions} from '@tanstack/react-query';
import {AxiosRequestConfig} from "axios";

import axiosInstance from "@/axiosInstance.ts";

import {BaseApiModel} from "@api/BaseApiModel.ts";
import {BaseModel} from "@models/BaseModel.ts";

/**
 * Универсальный хук для GET-запросов, использующий useQuery, для получения одного объекта с поддержкой трансформации:
 */
export function useGetOneTemplate<ApiModel = BaseApiModel, Model = BaseModel>(
    queryKey: QueryKey,
    url: string,
    params?: AxiosRequestConfig['params'],
    options?: Omit<UseQueryOptions<Model>, 'queryKey' | 'queryFn'>,
    transform?: (data: ApiModel) => Model
) {
    return useQuery<Model>({
        queryKey: [...queryKey, params],
        queryFn: async () => {
            const response = await axiosInstance.get<ApiModel>(url, {
                params,
            });
            return transform ? transform(response.data) : (response.data as unknown as Model);
        },
        ...options,
    });
}
