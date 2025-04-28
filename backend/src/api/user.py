from typing import Annotated

from fastapi import APIRouter, Query

from data.query import GetUsersParams, UserListResponse, GetUser, CleandayListResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/")
async def get_users(query: Annotated[GetUsersParams, Query()]) -> UserListResponse:
    return UserListResponse(users=[])


@router.get("/{user_id}")
async def get_user(user_id: str) -> GetUser:
    return GetUser(
        key="1",
        first_name="Иван",
        last_name="Иванов",
        middle_name="Иванович",
        sex="male",
        about_me="обо мне",
        score=0,
        level=1,
        cleanday_count=0,
        organized_count=0,
        stat=0,
        city="Санкт-Петербург"
    )


@router.get("/{user_id}/cleandays")
async def get_user_cleandays(user_id: str) -> CleandayListResponse:
    return CleandayListResponse(cleandays=[])


@router.get("/{user_id}/organized")
async def get_user_organized_cleandays(user_id: str) -> CleandayListResponse:
    return CleandayListResponse(cleandays=[])
