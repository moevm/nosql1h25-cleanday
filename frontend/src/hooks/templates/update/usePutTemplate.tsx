import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { AxiosRequestConfig } from "axios";

import axiosInstance from "@/axiosInstance.ts";

import { BaseApiModel } from "@api/BaseApiModel.ts";
import { BaseModel } from "@models/BaseModel.ts";

/**
 * Универсальный хук для PUT-запросов, использующий useMutation:
 */
export function usePutTemplate<
    RequestData = unknown,
    ApiResponse = Partial<BaseApiModel>,
    ResponseModel = BaseModel
>(
    url: string,
    options?: Omit<UseMutationOptions<ResponseModel, unknown, RequestData>, 'mutationFn'>,
    transformResponse?: (data: ApiResponse) => ResponseModel,
    config?: AxiosRequestConfig
) {
    return useMutation<ResponseModel, unknown, RequestData>({
        mutationFn: async (data: RequestData) => {
            const response = await axiosInstance.put<ApiResponse>(url, data, config);
            return transformResponse 
                ? transformResponse(response.data) 
                : (response.data as unknown as ResponseModel);
        },
        ...options,
    });
}
