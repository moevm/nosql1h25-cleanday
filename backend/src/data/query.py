from datetime import datetime
from enum import StrEnum, auto
from typing import Optional

from pydantic import BaseModel, Field

from data.entity import User, Sex, CleanDayStatus, CleanDayTag, Requirement


class SortOrder(StrEnum):
    ASC = auto()
    DESC = auto()


class UserSortField(StrEnum):
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
    offset: int = Field(0, ge=0)
    limit: int = Field(20, ge=1, le=50)
    sort_by: Optional[UserSortField] = None
    sort_order: Optional[SortOrder] = None
    search_query: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    middle_name: Optional[str] = None
    login: Optional[str] = None
    sex: Optional[list[str]] = None
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


class GetCleandayRequirement(Requirement):
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


class CleandaySortField(StrEnum):
    NAME = auto()
    BEGIN_DATE = auto()
    END_DATE = auto()
    ORGANIZATION = auto()
    AREA = auto()
    STATUS = auto()
    RECOMMENDED_COUNT = auto()


class GetCleandaysParams(BaseModel):
    offset: int = Field(0, ge=0)
    limit: int = Field(20, ge=1, le=50)
    sort_by: Optional[UserSortField] = None
    sort_order: Optional[SortOrder] = None
    search_query: Optional[str] = None
    name: Optional[str] = None
    organization: Optional[str] = None
    statuses: Optional[list[str]] = None
    begin_date_from: Optional[datetime] = None
    begin_date_to: Optional[datetime] = None
    end_date_from: Optional[int] = None
    end_date_to: Optional[int] = None
    area_from: Optional[int] = Field(None, ge=0)
    area_to: Optional[int] = None
    count_from: Optional[int] = Field(None, ge=0)
    count_to: Optional[int] = None
    tags: Optional[list[str]] = None


class GetMembersParams(GetUsersParams):
    requirements: Optional[list[str]] = None
    participation_type: Optional[list[str]] = None


class PaginationParams(BaseModel):
    offset: int = Field(0, ge=0)
    limit: int = Field(20, ge=1, le=50)