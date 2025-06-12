import {CleandayApiModel, RequirementApiModel} from "@api/cleanday/models.ts";
import {Cleanday, CleandayStatus, CleandayTag} from "@models/Cleanday.ts";
import {locationMapper} from "@utils/location/mapper.ts";

export const cleandayMapper = (apiModel: CleandayApiModel): Cleanday => {
    return {
        id: apiModel.key,
        name: apiModel.name,
        description: apiModel.description,
        participantsCount: apiModel.participant_count,
        recommendedParticipantsCount: apiModel.recommended_count,
        city: apiModel.city,
        location: locationMapper(apiModel.location),
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
