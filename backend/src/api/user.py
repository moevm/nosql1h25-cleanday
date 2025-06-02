from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Query, Depends, HTTPException, status

from auth.service import get_current_user
import auth.service as auth_service
from data.entity import User, Image
from data.query import GetUsersParams, UserListResponse, GetUser, CleandayListResponse, PaginationParams, UpdateUser, \
    CreateCleanday, GetExtendedUser, SetAvatar
from repo.client import database
from repo.log_repo import LogRepo
from repo.model import CreateLog, LogRelations
from repo.user_repo import UserRepo
from repo import model as repo_model

router = APIRouter(prefix="/users", tags=["users"],
                   dependencies=[Depends(get_current_user)])

static_user_repo = UserRepo(database)


@router.get("/")
async def get_users(query: Annotated[GetUsersParams, Query()]) -> UserListResponse:
    count, page = static_user_repo.get_page(query)
    return UserListResponse(users=page, total_count=count)


@router.get("/{user_id}")
async def get_user(user_id: str) -> GetExtendedUser:
    user = static_user_repo.get_by_key(user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


@router.patch("/{user_id}")
async def update_user(user_id: str, payload: UpdateUser,
                      current_user: User = Depends(get_current_user)) -> GetExtendedUser:
    if user_id != current_user.key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Cannot modify other users")

    trans = database.begin_transaction(read=['User', 'lives_in', 'Log'],
                                       write=['User', 'lives_in', 'Log', 'relates_to_user', 'relates_to_city'])
    try:
        user_repo = UserRepo(trans)
        log_repo = LogRepo(trans)

        payload_dict = payload.model_dump(exclude_none=True)

        if 'password' in payload_dict:
            payload_dict['password'] = auth_service.hash_password(payload_dict['password'])

        update = repo_model.UpdateUser(**payload_dict)

        update = user_repo.update(user_id, update)
        if not update:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found')

        log_repo.create(
            CreateLog(
                date=datetime.now(),
                type="UpdateUser",
                description=f"Пользователь '{update.login}' обновил данные профиля",
                keys=LogRelations(
                    user_key=user_id
                )
            )
        )

        if 'city_id' in payload_dict:
            res = user_repo.set_city(user_id, payload_dict['city_id'])
            if not res:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='City not found')

            log_repo.create(
                CreateLog(
                    date=datetime.now(),
                    type="UpdateUserCity",
                    description=f"Пользователь '{update.login}' обновил свой город",
                    keys=LogRelations(
                        user_key=user_id,
                        city_key=payload_dict['city_id']
                    )
                )
            )

    except Exception as e:
        trans.abort_transaction()
        raise e
    else:
        trans.commit_transaction()

    user = static_user_repo.get_by_key(user_id)
    return user


@router.get("/{user_id}/avatar")
async def get_user_avatar(user_id: str) -> Image:
    image = static_user_repo.get_image(user_id)
    if not image:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return image


@router.put("/{user_id}/avatar")
async def upload_user_avatar(user_id: str, avatar: SetAvatar,
                             current_user: User = Depends(get_current_user)) -> bool:
    if user_id != current_user.key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Cannot modify other users")

    trans = database.begin_transaction(read=['User', 'lives_in', 'Log'],
                                       write=['User', 'lives_in', 'Log', 'relates_to_user', 'relates_to_city', 'Image'])

    try:
        user_repo = UserRepo(trans)
        log_repo = LogRepo(trans)

        res = user_repo.set_image(user_id, avatar.photo)

        if not res:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found')

        log_repo.create(
            CreateLog(
                date=datetime.now(),
                type="UpdateUserAvatar",
                description=f"Пользователь '{current_user.login}' обновил свой аватар",
                keys=LogRelations(
                    user_key=user_id
                )
            )
        )
    except Exception as e:
        trans.abort_transaction()
        raise e
    else:
        trans.commit_transaction()

    return True



@router.get("/{user_id}/cleandays")
async def get_user_cleandays(user_id: str, query: Annotated[PaginationParams, Query()]) -> CleandayListResponse:
    res = static_user_repo.get_cleandays(user_id, query)
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    count, page = res
    return CleandayListResponse(cleandays=page, total_count=count)


@router.get("/{user_id}/organized")
async def get_user_organized_cleandays(user_id: str,
                                       query: Annotated[PaginationParams, Query()]) -> CleandayListResponse:
    res = static_user_repo.get_organized(user_id, query)
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    count, page = res
    return CleandayListResponse(cleandays=page, total_count=count)


@router.get("/graph")
async def get_users_graph(attribute_1: str, attribute_2: str):
    return


@router.put("/{user_id}/password")
async def check_user_password(user_id: str, password: str) -> bool:
    return True
