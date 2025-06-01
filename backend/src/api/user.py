from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Query

from data.query import GetUsersParams, UserListResponse, GetUser, CleandayListResponse, PaginationParams, UpdateUser, \
    CreateCleanday, GetExtendedUser

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/")
async def get_users(query: Annotated[GetUsersParams, Query()]) -> UserListResponse:
    return UserListResponse(users=[], total_count=0)


@router.get("/{user_id}")
async def get_user(user_id: str) -> GetExtendedUser:
    return GetExtendedUser(
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
        city="Санкт-Петербург",
        created_at=datetime(2025, 2, 1),
        updated_at=datetime(2025, 2, 1),
    )


@router.patch("/{user_id}")
async def update_user(user_id: str, payload: UpdateUser) -> GetUser:
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


@router.get("/{user_id}/picture")
async def get_user_picture(user_id: str) -> None:
    return None


@router.post("/{user_id}/picture")
async def upload_user_picture(user_id: str) -> None:
    return None


@router.get("/{user_id}/cleandays")
async def get_user_cleandays(user_id: str, query: Annotated[PaginationParams, Query()]) -> CleandayListResponse:
    return CleandayListResponse(cleandays=[], total_count=0)


@router.get("/{user_id}/organized")
async def get_user_organized_cleandays(user_id: str, query: Annotated[PaginationParams, Query()]) -> CleandayListResponse:
    return CleandayListResponse(cleandays=[], total_count=0)


@router.get("/graph")
async def get_users_graph(attribute_1: str, attribute_2: str):
    return


@router.put("/{user_id}/password")
async def check_user_password(user_id: str, password: str) -> bool:
    return True
