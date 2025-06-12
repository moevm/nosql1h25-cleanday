export interface BaseModel {
    id: string;
}

export interface BasePaginatedModel<T = BaseModel> {
    contents: T[];
    totalCount: number;
}
