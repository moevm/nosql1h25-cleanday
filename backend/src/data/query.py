from datetime import datetime
from enum import StrEnum, auto
from typing import Optional, List

from pydantic import BaseModel, Field

from data.entity import User, Sex, CleanDayStatus, CleanDayTag, Requirement, Log, Comment, ParticipationType, Location, \
    City, Image, Participation
from repo.model import CreateImage


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
    CLEANDAY_COUNT = auto()
    ORGANIZED_COUNT = auto()
    STAT = auto()


class UpdateCleanDayStatus(StrEnum):
    PLANNED = "Запланирован"
    ONGOING = "Проходит"
    CANCELLED = "Отменен"
    RESCHEDULED = "Перенесен"


class GetUsersParams(BaseModel):
    offset: int = Field(0, ge=0)
    limit: int = Field(20, ge=1, le=50)
    sort_by: UserSortField = UserSortField.LOGIN
    sort_order: SortOrder = SortOrder.ASC
    search_query: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    login: Optional[str] = None
    sex: Optional[list[Sex]] = None
    city: Optional[str] = None
    level_from: Optional[int] = Field(None, ge=1)
    level_to: Optional[int] = None
    cleanday_count_from: Optional[int] = Field(None, ge=0)
    cleanday_count_to: Optional[int] = None
    organized_count_from: Optional[int] = Field(None, ge=0)
    organized_count_to: Optional[int] = None
    stat_from: Optional[int] = Field(None, ge=0)
    stat_to: Optional[int] = None


class GetUser(BaseModel):
    key: str
    first_name: str
    last_name: str
    login: str
    sex: Sex
    city: str
    about_me: str
    score: int
    level: int
    cleanday_count: int
    organized_count: int
    stat: int


class GetExtendedUser(GetUser):
    created_at: datetime
    updated_at: datetime


class UserListResponse(BaseModel):
    users: list[GetUser]
    total_count: int


class GetCleandayRequirement(Requirement):
    users_amount: int


class GetCleanday(BaseModel):
    key: str
    name: str
    description: str
    participant_count: int
    recommended_count: int
    city: str
    location: Location
    begin_date: datetime
    end_date: datetime
    created_at: datetime
    updated_at: datetime
    organization: str
    organizer: str
    organizer_key: str
    area: int
    status: CleanDayStatus
    tags: list[CleanDayTag]
    requirements: list[GetCleandayRequirement]
    results: Optional[list[str]] = None


class CleandayListResponse(BaseModel):
    cleandays: list[GetCleanday]
    total_count: int


class CleandaySortField(StrEnum):
    NAME = auto()
    BEGIN_DATE = auto()
    END_DATE = auto()
    ORGANIZATION = auto()
    AREA = auto()
    STATUS = auto()
    RECOMMENDED_COUNT = auto()
    PARTICIPANT_COUNT = auto()


class GetCleandaysParams(BaseModel):
    offset: int = Field(0, ge=0)
    limit: int = Field(20, ge=1, le=50)
    sort_by: CleandaySortField = CleandaySortField.BEGIN_DATE
    sort_order: SortOrder = SortOrder.ASC
    search_query: Optional[str] = None
    name: Optional[str] = None
    organization: Optional[str] = None
    organizer: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    status: Optional[list[str]] = None
    begin_date_from: Optional[datetime] = None
    begin_date_to: Optional[datetime] = None
    end_date_from: Optional[datetime] = None
    end_date_to: Optional[datetime] = None
    created_at_from: Optional[datetime] = None
    created_at_to: Optional[datetime] = None
    updated_at_from: Optional[datetime] = None
    updated_at_to: Optional[datetime] = None
    area_from: Optional[int] = Field(None, ge=0)
    area_to: Optional[int] = None
    recommended_count_from: Optional[int] = Field(None, ge=0)
    recommended_count_to: Optional[int] = None
    participant_count_from: Optional[int] = Field(None, ge=0)
    participant_count_to: Optional[int] = None
    tags: Optional[list[str]] = None


class GetMembersParams(GetUsersParams):
    requirements: Optional[list[str]] = None
    participation_type: Optional[list[ParticipationType]] = None


class PaginationParams(BaseModel):
    offset: int = Field(0, ge=0)
    limit: int = Field(20, ge=1, le=50)


class CleandayLog(Log):
    user: Optional[User] = None
    comment: Optional[Comment] = None
    location: Optional[Location] = None


class CleandayLogListResponse(BaseModel):
    logs: list[CleandayLog]
    total_count: int


class GetComment(Comment):
    author: GetUser


class CommentListResponse(BaseModel):
    comments: list[GetComment]
    total_count: int


class UpdateUser(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    sex: Optional[Sex] = None
    city_id: Optional[str] = None
    about_me: Optional[str] = None
    password: Optional[str] = None


class CreateCleanday(BaseModel):
    name: str
    location_id: str
    begin_date: datetime
    end_date: datetime
    organization: str
    area: int
    description: str
    recommended_count: int
    tags: list[CleanDayTag]
    requirements: list[str]


class UpdateCleanday(BaseModel):
    name: Optional[str] = None
    location_id: Optional[str] = None
    begin_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    organization: Optional[str] = None
    area: Optional[int] = None
    description: Optional[str] = None
    recommended_count: Optional[int] = None
    tags: Optional[list[CleanDayTag]] = None
    status: Optional[UpdateCleanDayStatus] = None
    requirements: Optional[list[str]] = None


class GetMember(GetUser):
    requirements: list[Requirement]
    participation_type: ParticipationType

      
class GetCitiesParams(PaginationParams):
    search_query: str = ""
    sort_order: SortOrder = SortOrder.ASC


class CityListResponse(BaseModel):
    contents: list[City]
    total_count: int


class CreateLocation(BaseModel):
    address: str
    instructions: str
    city_key: str


class LocationSortField(StrEnum):
    ADDRESS = auto()
    CITY_NAME = "city_name"


class GetLocationsParams(PaginationParams):
    search_query: str = ""
    address: str = ""
    city_name: str = ""
    sort_by: LocationSortField = LocationSortField.ADDRESS
    sort_order: SortOrder = SortOrder.ASC


class GetLocation(Location):
    city: City


class LocationListResponse(BaseModel):
    contents: list[GetLocation]
    total_count: int


class CreateImages(BaseModel):
    images: list[CreateImage]


class ImageListResponse(BaseModel):
    contents: list[Image]


class SetAvatar(BaseModel):
    photo: str


class UpdateParticipation(BaseModel):
    type: Optional[ParticipationType] = None
    requirement_keys: Optional[list[str]] = None


class CreateParticipation(BaseModel):
    type: ParticipationType


class CleandayResults(BaseModel):
    participated_user_keys: list[str]
    results: list[str]
    images: list[CreateImage]


class LogSortField(StrEnum):
    DATE = auto()


class GetCleandayLogsParams(PaginationParams):
    sort_by: LogSortField = LogSortField.DATE
    sort_order: SortOrder = SortOrder.DESC

    type: Optional[str] = None
    description: Optional[str] = None
    search_query: Optional[str] = None
    user_login: Optional[str] = None
    location_address: Optional[str] = None
    comment_text: Optional[str] = None

    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None


class GetCommentsParams(PaginationParams):
    sort_by: LogSortField = LogSortField.DATE
    sort_order: SortOrder = SortOrder.DESC

    search_query: Optional[str] = None

    user_login: Optional[str] = None
    text: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None


class HeatmapEntry(BaseModel):
    x_label: str
    y_label: str
    count: int


class HeatmapResponse(BaseModel):
    data: list[HeatmapEntry]


class UserHeatmapField(StrEnum):
    first_name = "first_name"
    last_name = "last_name"
    login = "login"
    sex = "sex"
    city = "city"
    about_me = "about_me"
    score = "score"
    level = "level"
    cleanday_count = "cleanday_count"
    organized_count = "organized_count"
    stat = "stat"


class UserHeatmapQuery(GetUsersParams):
    x_field: UserHeatmapField
    y_field: UserHeatmapField


class CleandayHeatmapField(StrEnum):
    name = "name"
    description = "description"
    participant_count = "participant_count"
    recommended_count = "recommended_count"
    city = "city"
    begin_date = "begin_date"
    end_date = "end_date"
    created_at = "created_at"
    updated_at = "updated_at"
    organization = "organization"
    organizer = "organizer"
    organizer_key = "organizer_key"
    area = "area"
    status = "status"
    tag = "tags"
    requirement = "requirements"
    location_address = "location.address"


class CleandayHeatmapQuery(GetCleandaysParams):
    x_field: CleandayHeatmapField
    y_field: CleandayHeatmapField


class CreateComment(BaseModel):
    text: str


class GetMembersResponse(BaseModel):
    users: list[GetMember]
    total_count: int


class RequirementListResponse(BaseModel):
    contents: List[Requirement]
    total_count: int
