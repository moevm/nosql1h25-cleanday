from typing import Annotated

from fastapi import APIRouter, Query

from data.query import GetUserParams, GetUserResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/")
async def get_users(query: Annotated[GetUserParams, Query()]) -> GetUserResponse:
    return GetUserResponse(users=[])
