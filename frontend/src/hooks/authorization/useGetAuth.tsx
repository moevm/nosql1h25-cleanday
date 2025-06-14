import {useMutation, UseMutationResult,} from '@tanstack/react-query';

import {useLocation, useNavigate,} from 'react-router-dom';

import axiosInstance from "@/axiosInstance.ts";

import {AuthFormData, AuthResponse} from '@models/Auth'

import {LOGIN} from '@api/authorization/endpoints.ts'

import {useAuth} from '@hooks/authorization/useAuth';


type getAuthResult = UseMutationResult<AuthResponse, Error, AuthFormData, unknown>;

export const useGetAuth = (): getAuthResult => {
    const {login} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    return useMutation<AuthResponse, Error, AuthFormData>({
        mutationFn: async (credentials) => {
            const params = new URLSearchParams();
            params.append('username', credentials.username);
            params.append('password', credentials.password);

            const response = await axiosInstance.post<AuthResponse>(
                LOGIN,
                params,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );
            return response.data;
        },
        onSuccess: (data: AuthResponse, credentials) => {
            login(data.access_token, credentials.username);
            
            // Пытаемся вернуться на предыдущую страницу, если есть сохранённый путь
            const from = location.state?.from?.pathname || "/";
            navigate(from);
        },
        retry: 1,
    });
};
