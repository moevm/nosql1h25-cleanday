from enum import StrEnum, auto
from typing import Optional

from pydantic import BaseModel, Field

from data.entity import User


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


class GetUserParams(BaseModel):
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


class GetUserResponse(BaseModel):
    users: list[User]
