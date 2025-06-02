from datetime import datetime
from typing import Annotated

from pydantic import BaseModel
from fastapi import APIRouter, Query, Depends

from auth.service import get_current_user
from data.entity import CleanDayStatus, CleanDay
from data.query import GetCleandaysParams, CleandayListResponse, GetCleanday, UserListResponse, GetMembersParams, \
    PaginationParams, CleandayLogListResponse, CommentListResponse, UpdateCleanday, CreateCleanday, CreateImages, \
    ImageListResponse

router = APIRouter(prefix="/cleandays", tags=["cleanday"],
                   dependencies=[Depends(get_current_user)])


@router.get("/")
async def get_cleandays(query: Annotated[GetCleandaysParams, Query()]) -> CleandayListResponse:
    return CleandayListResponse(cleandays=[], total_count=0)


@router.post("/")
async def create_cleanday(cleanday: CreateCleanday) -> CleanDay:
    return CleanDay(
        **cleanday.model_dump()
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


@router.post("/{cleanday_id}/images")
async def create_cleanday_images(cleanday_id: str, images: CreateImages):
    return {"message": "Picture uploaded successfully", "cleanday_id": cleanday_id}


@router.get("/{cleanday_id}/images")
async def get_cleanday_images(cleanday_id: str) -> ImageListResponse:
    return ImageListResponse(contents=[])


@router.get("/{cleanday_id}/members")
async def get_cleanday_members(cleanday_id: str, query: Annotated[GetMembersParams, Query()]) -> UserListResponse:
    return UserListResponse(users=[], total_count=0)


@router.get("/{cleanday_id}/logs")
async def get_cleanday_logs(cleanday_id: str, query: Annotated[PaginationParams, Query()]) -> CleandayLogListResponse:
    return CleandayLogListResponse(logs=[], total_count=0)


@router.get("/{cleanday_id}/comments")
async def get_cleanday_comments(cleanday_id: str, query: Annotated[PaginationParams, Query()]) -> CommentListResponse:
    return CommentListResponse(comments=[], total_count=0)


@router.post("/{cleanday_id}/comments")
async def create_cleanday_comment(cleanday_id: str, comment: str):
    return


@router.post("/{cleanday_id}/members")
async def join_cleanday(cleanday_id: str):
    return


@router.patch("/{cleanday_id}/members/me")
async def update_participation(cleanday_id: str, participation: str):
    return


@router.post("/{cleanday_id}/end")
async def end_cleanday(cleanday_id: str):
    return


@router.get("/graph")
async def get_cleanday_graph(attribute_1: str, attribute_2: str):
    return
