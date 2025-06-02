from datetime import datetime, UTC
from typing import Annotated

from pydantic import BaseModel
from fastapi import APIRouter, Query, Depends, HTTPException, status

from auth.service import get_current_user
from data.entity import CleanDayStatus, CleanDay, User, CleanDayTag, Comment
from data.query import GetCleandaysParams, CleandayListResponse, GetCleanday, UserListResponse, GetMembersParams, \
    PaginationParams, CleandayLogListResponse, CommentListResponse, UpdateCleanday, CreateCleanday, CreateImages, \
    ImageListResponse, UpdateParticipation, CreateParticipation, CleandayResults, GetCleandayLogsParams
from repo.cleanday_repo import CleandayRepo
from repo.client import database
import repo.model as repo_model
from repo.location_repo import LocationRepo
from repo.log_repo import LogRepo
from repo.participation_repo import ParticipationRepo, SetReqResult, CreateResult

router = APIRouter(prefix="/cleandays", tags=["cleanday"],
                   dependencies=[Depends(get_current_user)])

static_cleanday_repo = CleandayRepo(database)


@router.get("/")
async def get_cleandays(query: Annotated[GetCleandaysParams, Query()]) -> CleandayListResponse:
    count, page = static_cleanday_repo.get_page(query)
    return CleandayListResponse(cleandays=page, total_count=count)


@router.post("/")
async def create_cleanday(cleanday: CreateCleanday,
                          current_user: User = Depends(get_current_user)) -> CleanDay:
    trans = database.begin_transaction(read=['Location', 'CleanDay', 'in_location', 'Participation', 'User',
                                             'has_participation', 'participation_in'],
                                       write=['Location', 'CleanDay', 'in_location', 'Participation',
                                              'has_participation', 'participation_in', 'Requirement',
                                              'has_requirement', 'Log', 'relates_to_user', 'relates_to_cleanday'])
    try:
        cleanday_repo = CleandayRepo(trans)
        log_repo = LogRepo(trans)

        cleanday_dict = cleanday.model_dump()
        cleanday_dict['status'] = CleanDayStatus.PLANNED
        create_cleanday = repo_model.CreateCleanday.model_validate(cleanday_dict)

        res = cleanday_repo.create(current_user.key, create_cleanday)

        loc_set = cleanday_repo.set_location(res.key, cleanday.location_id)

        if not loc_set:
            raise HTTPException(status_code=404, detail="Location not found")

        log_repo.create(
            repo_model.CreateLog(
                date=datetime.now(UTC),
                type='CreateCleanday',
                description='Субботник создан',
                keys=repo_model.LogRelations(
                    cleanday_key=res.key,
                    location_key=cleanday.location_id,
                    user_key=current_user.key
                )
            )
        )

    except Exception as e:
        trans.abort_transaction()
        raise e
    else:
        trans.commit_transaction()

    return res


@router.get("/{cleanday_id}")
async def get_cleanday(cleanday_id: str) -> GetCleanday:
    cleanday = static_cleanday_repo.get_by_key(cleanday_id)
    if not cleanday:
        raise HTTPException(status_code=404, detail="Cleanday not found")

    return cleanday


@router.patch("/{cleanday_id}")
async def update_cleanday(cleanday_id: str, cleanday: UpdateCleanday,
                          current_user: User = Depends(get_current_user)) -> GetCleanday:
    trans = database.begin_transaction(read=['CleanDay', 'in_location', 'Location', 'Participation', 'User',
                                             'has_participation', 'participation_in'],
                                       write=['in_location', 'CleanDay', 'Log', 'relates_to_cleanday',
                                              'relates_to_location'])
    try:
        cleanday_repo = CleandayRepo(trans)
        log_repo = LogRepo(trans)

        cleanday_obj = cleanday_repo.get_by_key(cleanday_id)
        if not cleanday_obj:
            raise HTTPException(status_code=404, detail="Cleanday not found")

        if cleanday_obj.organizer_key != current_user.key:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Insufficient permissions")

        cleanday_dict = cleanday.model_dump(exclude_none=True)
        cleanday_update = repo_model.UpdateCleanday.model_validate(cleanday_dict)

        cleanday_repo.update(cleanday_id, cleanday_update)

        log_repo.create(
            repo_model.CreateLog(
                date=datetime.now(UTC),
                type='UpdateCleanday',
                description='Данные субботника обновлены',
                keys=repo_model.LogRelations(
                    cleanday_key=cleanday_id
                )
            )
        )

        if cleanday.location_id is not None:
            loc_res = cleanday_repo.set_location(cleanday_id, cleanday.location_id)
            if not loc_res:
                raise HTTPException(status_code=404, detail="Location not found")
            log_repo.create(
                repo_model.CreateLog(
                    date=datetime.now(UTC),
                    type='UpdateCleandayLocation',
                    description='Локация субботника обновлена',
                    keys=repo_model.LogRelations(
                        cleanday_key=cleanday_id,
                        location_key=cleanday.location_id
                    )
                )
            )

    except Exception as e:
        trans.abort_transaction()
        raise e
    else:
        trans.commit_transaction()

    return static_cleanday_repo.get_by_key(cleanday_id)


@router.get("/{cleanday_id}/images")
async def get_cleanday_images(cleanday_id: str) -> ImageListResponse:
    images = static_cleanday_repo.get_images(cleanday_id)
    if images is None:
        raise HTTPException(status_code=404, detail="Cleanday not found")

    return ImageListResponse(contents=images)


@router.get("/{cleanday_id}/members")
async def get_cleanday_members(cleanday_id: str, query: Annotated[GetMembersParams, Query()]) -> UserListResponse:
    page_res = static_cleanday_repo.get_members(cleanday_id, query)
    if page_res is None:
        raise HTTPException(status_code=404, detail="Cleanday not found")
    count, page = page_res
    return UserListResponse(users=page, total_count=count)


@router.get("/{cleanday_id}/logs")
async def get_cleanday_logs(cleanday_id: str, query: Annotated[GetCleandayLogsParams, Query()]) -> CleandayLogListResponse:
    page_res = static_cleanday_repo.get_logs(cleanday_id, query)
    if page_res is None:
        raise HTTPException(status_code=404, detail="Cleanday not found")
    count, page = page_res
    return CleandayLogListResponse(logs=page, total_count=count)


@router.get("/{cleanday_id}/comments")
async def get_cleanday_comments(cleanday_id: str, query: Annotated[PaginationParams, Query()]) -> CommentListResponse:
    page_res = static_cleanday_repo.get_comments(cleanday_id, query)
    if page_res is None:
        raise HTTPException(status_code=404, detail="Cleanday not found")
    count, page = page_res
    return CommentListResponse(comments=page, total_count=count)


@router.post("/{cleanday_id}/comments")
async def create_cleanday_comment(cleanday_id: str, comment: str,
                                  current_user: User = Depends(get_current_user)) -> Comment:
    if static_cleanday_repo.get_raw_by_key(cleanday_id) is None:
        raise HTTPException(status_code=404, detail="Cleanday not found")

    trans = database.begin_transaction(
        read=['Participation', 'participation_in', 'has_participation'],
        write=['Comment', 'has_comment', 'authored', 'Log', 'relates_to_user', 'relates_to_cleanday',
               'relates_to_comment']
    )
    try:
        par_repo = ParticipationRepo(trans)
        log_repo = LogRepo(trans)

        comm = par_repo.create_comment(
            current_user.key, cleanday_id,
            repo_model.CreateComment(
                text=comment,
                date=datetime.now(UTC)
            )
        )

        if comm is None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Participation not found")

        log_repo.create(
            repo_model.CreateLog(
                date=datetime.now(UTC),
                type='CommentCreated',
                description='Пользователь оставил комментарий',
                keys=repo_model.LogRelations(
                    cleanday_key=cleanday_id,
                    user_key=current_user.key,
                    comment_key=comm.key
                )
            )
        )
    except Exception as e:
        trans.abort_transaction()
        raise e
    else:
        trans.commit_transaction()

    return comm


@router.post("/{cleanday_id}/members")
async def join_cleanday(cleanday_id: str, participation: CreateParticipation,
                        current_user: User = Depends(get_current_user)):
    cleanday = static_cleanday_repo.get_raw_by_key(cleanday_id)
    if cleanday is None:
        raise HTTPException(status_code=404, detail="Cleanday not found")

    trans = database.begin_transaction(
        read=['Participation', 'participation_in', 'has_participation'],
        write=['Participation', 'fullfills', 'Log', 'relates_to_user', 'relates_to_cleanday',
               'has_participation', 'participation_in']
    )
    try:
        par_repo = ParticipationRepo(trans)
        log_repo = LogRepo(trans)

        res, par = par_repo.create(current_user.key, cleanday_id, participation.type)

        if res == CreateResult.PARTICIPATION_ALREADY_EXISTS:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Participation already exists")

        log_repo.create(
            repo_model.CreateLog(
                date=datetime.now(UTC),
                type='CreateParticipation',
                description=f'Пользователь вступил в участники субботника с типом \'{participation.type}\'',
                keys=repo_model.LogRelations(
                    cleanday_key=cleanday_id,
                    user_key=current_user.key
                )
            )
        )


    except Exception as e:
        trans.abort_transaction()
        raise e
    else:
        trans.commit_transaction()

    return


@router.patch("/{cleanday_id}/members/me")
async def update_participation(cleanday_id: str, participation: UpdateParticipation,
                               current_user: User = Depends(get_current_user)):

    cleanday = static_cleanday_repo.get_by_key(cleanday_id)
    if cleanday is None:
        raise HTTPException(status_code=404, detail="Cleanday not found")

    if cleanday.organizer_key == current_user.key and participation.type is not None:
        raise HTTPException(status_code=409, detail="Organizer participation type cannot be updated")

    trans = database.begin_transaction(
        read=['Participation', 'participation_in', 'has_participation'],
        write=['Participation', 'fullfills', 'Log', 'relates_to_user', 'relates_to_cleanday']
    )
    try:
        par_repo = ParticipationRepo(trans)
        log_repo = LogRepo(trans)

        if participation.type is not None:
            res = par_repo.update(
                current_user.key, cleanday_id,
                repo_model.UpdateParticipation(type=participation.type)
            )
            if res is None:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Participation not found")
            log_repo.create(
                repo_model.CreateLog(
                    date=datetime.now(UTC),
                    type='ChangeParticipationType',
                    description=f'Пользователь обновил свой тип участия на \'{participation.type}\'',
                    keys=repo_model.LogRelations(
                        cleanday_key=cleanday_id,
                        user_key=current_user.key
                    )
                )
            )

        if participation.requirement_keys is not None:
            res = par_repo.set_requirements(current_user.key, cleanday_id, participation.requirement_keys)
            if res == SetReqResult.REQUIREMENT_DOES_NOT_EXIST:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Requirement not found")
            if res == SetReqResult.PARTICIPATION_DOES_NOT_EXIST:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Participation not found")
            log_repo.create(
                repo_model.CreateLog(
                    date=datetime.now(UTC),
                    type='ChangeParticipationRequirements',
                    description=f'Пользователь обновил свои выполняемые требования',
                    keys=repo_model.LogRelations(
                        cleanday_key=cleanday_id,
                        user_key=current_user.key
                    )
                )
            )

    except Exception as e:
        trans.abort_transaction()
        raise e
    else:
        trans.commit_transaction()

    return


@router.post("/{cleanday_id}/end")
async def end_cleanday(cleanday_id: str, results: CleandayResults,
                       current_user: User = Depends(get_current_user)):
    cleanday = static_cleanday_repo.get_by_key(cleanday_id)
    if cleanday is None:
        raise HTTPException(status_code=404, detail="Cleanday not found")

    if cleanday.organizer_key != current_user.key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Insufficient permissions")

    if cleanday.status == CleanDayStatus.ENDED:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Cleanday already ended")

    trans = database.begin_transaction(
        read=['Participation', 'participation_in', 'has_participation', 'CleanDay'],
        write=['Participation', 'Log', 'CleanDay', 'relates_to_cleanday', 'Image', 'cleanday_image']
    )
    try:
        cleanday_repo = CleandayRepo(trans)
        log_repo = LogRepo(trans)

        participation_repo = ParticipationRepo(trans)

        cleanday_repo.update(cleanday_id,
                             repo_model.UpdateCleanday(results=results.results,
                                                       status=CleanDayStatus.ENDED))

        for user_key in results.participated_user_keys:
            participation_repo.update(
                user_key, cleanday_id,
                repo_model.UpdateParticipation(real_presence=True, stat=cleanday.area)
            )

        cleanday_repo.create_images(cleanday_id, results.images)

        log_repo.create(
            repo_model.CreateLog(
                date=datetime.now(UTC),
                type='EndCleanday',
                description=f'Субботник завершён',
                keys=repo_model.LogRelations(
                    cleanday_key=cleanday_id
                )
            )
        )

    except Exception as e:
        trans.abort_transaction()
        raise e
    else:
        trans.commit_transaction()
    return


@router.get("/graph")
async def get_cleanday_graph(attribute_1: str, attribute_2: str):
    return
