import { StatisticsApiModel } from "@api/statistics/models";
import { Statistics } from "@models/Statistics";

export const statisticsMapper = (apiModel: StatisticsApiModel): Statistics => ({
    userCount: apiModel.user_count,
    participatedUserCount: apiModel.participated_user_count,
    cleandayCount: apiModel.cleanday_count,
    pastCleandayCount: apiModel.past_cleanday_count,
    cleandayMetric: apiModel.cleanday_metric,
});
