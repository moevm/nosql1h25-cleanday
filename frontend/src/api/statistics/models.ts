import {BaseApiModel, BaseGetParamsModel, BaseGetResponseModel, SortOrder} from "@api/BaseApiModel";

export interface StatisticsApiModel {
    user_count: number;
    participated_user_count: number;
    cleanday_count: number;
    past_cleanday_count: number;
    cleanday_metric: number;
}

export interface HeatmapEntry {
    x_label: string;
    y_label: string;
    count: number;
}

export interface HeatmapResponse extends BaseGetResponseModel {
    data: HeatmapEntry[];
}

export enum UserHeatmapField {
    FIRST_NAME = "first_name",
    LAST_NAME = "last_name",
    LOGIN = "login",
    SEX = "sex",
    CITY = "city",
    ABOUT_ME = "about_me",
    SCORE = "score",
    LEVEL = "level",
    CLEANDAY_COUNT = "cleanday_count",
    ORGANIZED_COUNT = "organized_count",
    STAT = "stat"
}

export interface UserHeatmapParams extends BaseGetParamsModel {
    x_field: UserHeatmapField;
    y_field: UserHeatmapField;
    first_name?: string;
    last_name?: string;
    login?: string;
    sex?: string;
    city?: string;
    level_from?: string;
    level_to?: string;
    cleanday_count_from?: string;
    cleanday_count_to?: string;
    organized_count_from?: string;
    organized_count_to?: string;
    stat_from?: string;
    stat_to?: string;
}

export enum CleandayHeatmapField {
    NAME = "name",
    DESCRIPTION = "description",
    PARTICIPANT_COUNT = "participant_count",
    RECOMMENDED_COUNT = "recommended_count",
    CITY = "city",
    BEGIN_DATE = "begin_date",
    END_DATE = "end_date",
    CREATED_AT = "created_at",
    UPDATED_AT = "updated_at",
    ORGANIZATION = "organization",
    ORGANIZER = "organizer",
    ORGANIZER_KEY = "organizer_key",
    AREA = "area",
    STATUS = "status",
    TAG = "tags",
    REQUIREMENT = "requirements",
    LOCATION_ADDRESS = "location.address"
}

export interface CleandayHeatmapParams extends BaseGetParamsModel {
    x_field: CleandayHeatmapField;
    y_field: CleandayHeatmapField;
    name?: string;
    organization?: string;
    organizer?: string;
    city?: string;
    address?: string;
    status?: string[];
    begin_date_from?: string;
    begin_date_to?: string;
    end_date_from?: string;
    end_date_to?: string;
    created_at_from?: string;
    created_at_to?: string;
    updated_at_from?: string;
    updated_at_to?: string;
    area_from?: number;
    area_to?: number;
    recommended_count_from?: number;
    recommended_count_to?: number;
    participant_count_from?: number;
    participant_count_to?: number;
    tags?: string[];
}