import {AuthorizationFormDate, AuthResponse} from "@api/authorization/models.ts";
import {useLocation, useNavigate,} from 'react-router-dom';
import {useAuth} from '@hooks/authorization/useAuth';
import {useMutation, UseMutationResult} from '@tanstack/react-query';
import {REGISTRATION} from "@api/authorization/endpoints.ts";
import axiosInstance from "@/axiosInstance.ts";

type getRegisterResult = UseMutationResult<AuthResponse, Error, AuthorizationFormDate>;

export const useGetRegister = (): getRegisterResult => {
    const {login} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    return useMutation<AuthResponse, Error, AuthorizationFormDate>({
        mutationFn: async (credentials: AuthorizationFormDate) => {
            const params = {
                first_name: credentials.first_name,
                last_name: credentials.last_name,
                login: credentials.login,
                sex: credentials.sex,
                password: credentials.password,
                city_id: credentials.city_id,
            };

            const response = await axiosInstance.post<AuthResponse>(
                REGISTRATION,
                params,
            );
            return response.data;
        },
        onSuccess: (data: AuthResponse, credentials: AuthorizationFormDate) => {
            login(data.access_token, credentials.username);

            // Пытаемся вернуться на предыдущую страницу, если есть сохранённый путь
            const from = location.state?.from?.pathname || "/";
            navigate(from);
        },
        onError: (error) => {
            console.error('Error updating user avatar:', error);
        },
        retry: 1,
    });
};