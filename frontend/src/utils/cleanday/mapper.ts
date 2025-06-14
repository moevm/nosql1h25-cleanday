import {CleandayApiModel, CleandayLogApiModel, CommentApiModel, RequirementApiModel} from "@api/cleanday/models.ts";
import {Cleanday, CleandayLog, CleandayStatus, CleandayTag} from "@models/Cleanday.ts";
import {locationMapper} from "@utils/location/mapper.ts";
import {userMapper} from "@utils/user/mapper.ts";
import {Comment} from "@models/Comment";

export const cleandayMapper = (apiModel: CleandayApiModel): Cleanday => {
    return {
        id: apiModel.key,
        name: apiModel.name,
        description: apiModel.description,
        participantsCount: apiModel.participant_count,
        recommendedParticipantsCount: apiModel.recommended_count,
        city: apiModel.city,
        location: apiModel.location ? locationMapper(apiModel.location) : undefined,
        beginDate: new Date(apiModel.begin_date),
        endDate: new Date(apiModel.end_date),
        createdAt: new Date(apiModel.created_at),
        updatedAt: new Date(apiModel.updated_at),
        organization: apiModel.organization,
        organizer: apiModel.organizer,
        organizerKey: apiModel.organizer_key,
        area: apiModel.area,
        status: apiModel.status as CleandayStatus,
        tags: apiModel.tags as CleandayTag[],
        requirements: apiModel.requirements ? apiModel.requirements.map((req: RequirementApiModel) => ({
            id: req.key,
            name: req.name,
            usersAmount: req.users_amount
        })) : [],
        results: apiModel.results || []
    };
};

export const commentMapper = (apiModel?: CommentApiModel): Comment | undefined => {
    if (!apiModel) {
        return undefined;
    }
    
    return {
        id: apiModel.key,
        text: apiModel.text,
        date: new Date(apiModel.date),
        author: apiModel.author ? userMapper(apiModel.author) : undefined
    };
};

export const cleandayLogMapper = (apiModel: CleandayLogApiModel): CleandayLog => {
    return {
        id: apiModel.key,
        date: new Date(apiModel.date),
        type: apiModel.type,
        description: apiModel.description,
        user: apiModel.user ? userMapper(apiModel.user) : undefined,
        comment: apiModel.comment ? commentMapper(apiModel.comment) : undefined,
        location: apiModel.location ? locationMapper(apiModel.location) : undefined
    };
};
