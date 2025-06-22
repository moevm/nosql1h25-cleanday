import { HeatmapEntry } from '@models/Statistics';
import { BasePaginatedModel } from '@models/BaseModel';

export interface StatisticsApiModel {
    user_count: number;
    participated_user_count: number;
    cleanday_count: number;
    past_cleanday_count: number;
    cleanday_metric: number;
}

/**
 * Parameters for user heatmap API request
 */
export interface UserHeatmapParams {
    x_field: string;
    y_field: string;
    [key: string]: unknown;  // Additional filters
}

/**
 * Parameters for cleanday heatmap API request
 */
export interface CleandayHeatmapParams {
    x_field: string;
    y_field: string;
    [key: string]: unknown;  // Additional filters
}

/**
 * Response type for heatmap API requests
 */
export type HeatmapResponse = BasePaginatedModel<HeatmapEntry>;

export type { HeatmapEntry };