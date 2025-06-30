import {Sex} from "@api/user/models.ts";

export interface AuthorizationFormDate{
    first_name: string;
    last_name: string;
    login: string;
    sex: Sex;
    password: string;
    city_id: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
}