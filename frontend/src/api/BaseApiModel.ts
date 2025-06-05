export interface BaseApiModel {
    key: string;
}

export interface BaseGetResponseModel {
    [key: string]: unknown;
    total_count: number;
}


export enum SortOrder {
    asc = 'asc',
    desc = 'desc',
}

export interface BaseGetParamsModel {
    offset?: number;
    limit?: number;
    search_query?: string;
    sort_order?: SortOrder;
}
