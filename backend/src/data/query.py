from datetime import datetime
from enum import StrEnum, auto
from typing import Optional

from pydantic import BaseModel, Field

from data.entity import User, Sex, CleanDayStatus, CleanDayTag


class SortOrder(StrEnum):
    ASC = auto()
    DESC = auto()


class SortField(StrEnum):
    FIRST_NAME = auto()
    LAST_NAME = auto()
    LOGIN = auto()
    SEX = auto()
    CITY = auto()
    LEVEL = auto()
    CLEANDAYS = auto()
    ORGANIZED = auto()
    STAT = auto()


class GetUsersParams(BaseModel):
    offset: Optional[int] = Field(None, ge=0)
    limit: Optional[int] = Field(None, ge=1, le=50)
    sort_by: Optional[SortField] = None
    sort_order: Optional[SortOrder] = None
    search_query: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    middle_name: Optional[str] = None
    login: Optional[str] = None
    sex: Optional[str] = None
    city: Optional[str] = None
    level_from: Optional[int] = Field(None, ge=1)
    level_to: Optional[int] = None
    cleandays_from: Optional[int] = Field(None, ge=0)
    cleandays_to: Optional[int] = None
    organized_from: Optional[int] = Field(None, ge=0)
    organized_to: Optional[int] = None
    stat_from: Optional[int] = Field(None, ge=0)
    stat_to: Optional[int] = None


class GetUser(BaseModel):
    key: str
    first_name: str
    last_name: str
    middle_name: str
    sex: Sex
    city: str
    about_me: str
    score: int
    level: int
    cleanday_count: int
    organized_count: int
    stat: int


class UserListResponse(BaseModel):
    users: list[GetUser]


class GetCleandayRequirement(BaseModel):
    key: str
    name: str
    users_amount: int


class GetCleanday(BaseModel):
    key: str
    name: str
    begin_date: datetime
    end_date: datetime
    organization: str
    area: int
    status: CleanDayStatus
    tags: list[CleanDayTag]
    requirements: list[GetCleandayRequirement]


class CleandayListResponse(BaseModel):
    cleandays: list[GetCleanday]