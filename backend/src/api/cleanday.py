from datetime import datetime
from typing import Annotated

from pydantic import BaseModel
from fastapi import APIRouter, Query

from data.entity import CleanDayStatus
from data.query import GetCleandaysParams, CleandayListResponse, GetCleanday, UserListResponse, GetMembersParams, \
    PaginationParams, CleandayLogListResponse, CommentListResponse, UpdateCleanday

router = APIRouter(prefix="/cleandays", tags=["cleanday"])


@router.get("/")
async def get_cleandays(query: Annotated[GetCleandaysParams, Query()]) -> CleandayListResponse:
    return CleandayListResponse(cleandays=[])


@router.post("/")
async def create_cleanday(cleanday: UpdateCleanday) -> GetCleanday:
    return GetCleanday(
        key="1",
        name=cleanday.name,
        begin_date=cleanday.begin_date,
        end_date=cleanday.end_date,
        organization=cleanday.organization,
        area=cleanday.area,
        status=CleanDayStatus.PLANNED,
        tags=cleanday.tags,
        requirements=cleanday.requirements
    )


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


@router.delete("/{cleanday_id}")
async def delete_cleanday(cleanday_id: str):
    return


@router.patch("/{cleanday_id}")
async def update_cleanday(cleanday_id: str, cleanday: UpdateCleanday) -> GetCleanday:
    return GetCleanday(
        key=cleanday_id,
        name=cleanday.name,
        begin_date=cleanday.begin_date,
        end_date=cleanday.end_date,
        organization=cleanday.organization,
        area=cleanday.area,
        status=CleanDayStatus.PLANNED,
        tags=cleanday.tags,
        requirements=cleanday.requirements
    )


@router.get("/{cleanday_id}/members")
async def get_cleanday_members(cleanday_id: str, query: Annotated[GetMembersParams, Query()]) -> UserListResponse:
    return UserListResponse(users=[])


@router.get("/{cleanday_id}/logs")
async def get_cleanday_logs(cleanday_id: str, query: Annotated[PaginationParams, Query()]) -> CleandayLogListResponse:
    return CleandayLogListResponse(logs=[])


@router.get("/{cleanday_id}/comments")
async def get_cleanday_comments(cleanday_id: str, query: Annotated[PaginationParams, Query()]) -> CommentListResponse:
    return CommentListResponse(comments=[])


@router.post("/{cleanday_id}/comments")
async def create_cleanday_comment(cleanday_id: str, comment: str):
    return


@router.post("/{cleanday_id}/join")
async def join_cleanday(cleanday_id: str):
    return


@router.patch("/{cleanday_id}/participation")
async def update_participation(cleanday_id: str, participation: str):
    return


@router.post("/{cleanday_id}/cancel")
async def cancel_cleanday(cleanday_id: str):
    return


@router.post("/{cleanday_id}/complete")
async def complete_cleanday(cleanday_id: str):
    return


@router.get("/{cleanday_id}/activity")
async def get_cleanday_activity(cleanday_id: str):
    return


@router.patch("/{cleanday_id}")
async def create_new_cleanday(cleanday_id: str, cleanday: UpdateCleanday):
    return


@router.get("/graph")
async def get_cleanday_graph(attribute_1: str, attribute_2: str) -> dict:
    return 