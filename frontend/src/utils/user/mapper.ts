import {UserApiModel} from "@api/user/models.ts";
import {User} from "@models/User.ts";

export const userMapper = (apiModel: UserApiModel): User => ({
    id: apiModel.key,
    firstName: apiModel.first_name,
    lastName: apiModel.last_name,
    login: apiModel.login,
    sex: apiModel.sex,
    city: apiModel.city,
    aboutMe: apiModel.about_me,
    score: apiModel.score,
    level: apiModel.level,
    participantsCount: apiModel.cleanday_count,
    organizedCount: apiModel.organized_count,
    cleaned: apiModel.stat,
});
