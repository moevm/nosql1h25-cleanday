export interface BaseModel {
    id: string;
}

export interface BasePaginatedModel<T = BaseModel> {
    data: T[];
    total: number;
}
