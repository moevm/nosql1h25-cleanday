export interface Statistics {
    userCount: number;
    participatedUserCount: number;
    cleandayCount: number;
    pastCleandayCount: number;
    cleandayMetric: number;
}

/**
 * Interface for a single heatmap data entry
 */
export interface HeatmapEntry {
    x_label: string;  // Changed from xLabel to match API response
    y_label: string;  // Changed from yLabel to match API response
    count: number;
}