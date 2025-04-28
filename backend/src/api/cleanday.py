from datetime import datetime
from typing import Annotated

from pydantic import BaseModel
from fastapi import APIRouter, Query

from data.entity import CleanDayStatus
from data.query import GetCleandaysParams, CleandayListResponse, GetCleanday, UserListResponse, GetMembersParams

router = APIRouter(prefix="/cleandays", tags=["cleanday"])


@router.get("/")
async def get_cleandays(query: Annotated[GetCleandaysParams, Query()]) -> CleandayListResponse:
    return CleandayListResponse(cleandays=[])


@router.get("/{cleanday_id}")
async def get_cleanday(cleanday_id: str) -> GetCleanday:
    return GetCleanday(
        key="2",
        name="Субботник",
        begin_date=datetime(2025, 10, 1, 13, 0, 0),
        end_date=datetime(2025, 10, 1, 16, 0, 0),
        organization="",
        area=100,
        status=CleanDayStatus.PLANNED,
        tags=[],
        requirements=[]
    )


@router.get("/{cleanday_id}/members")
async def get_cleanday(cleanday_id: str, query: Annotated[GetMembersParams, Query()]) -> UserListResponse:
    return UserListResponse(users=[])
