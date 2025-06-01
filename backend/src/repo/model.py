from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from data.entity import Sex, CleanDayTag, ParticipationType, CleanDayStatus


class CreateUser(BaseModel):
    first_name: str
    last_name: str
    login: str
    sex: Sex
    password: str
    about_me: str
    score: int


class UpdateUser(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    sex: Optional[Sex] = None
    about_me: Optional[str] = None
    password: Optional[str] = None
    score: Optional[int] = None


class CreateCleanday(BaseModel):
    name: str
    begin_date: datetime
    end_date: datetime
    organization: str
    area: int
    description: str
    status: CleanDayStatus
    recommended_count: int
    tags: list[CleanDayTag]
    requirements: list[str]


class UpdateCleanday(BaseModel):
    name: Optional[str] = None
    begin_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    organization: Optional[str] = None
    area: Optional[int] = None
    description: Optional[str] = None
    recommended_count: Optional[int] = None
    tags: Optional[list[CleanDayTag]] = None


class UpdateParticipation(BaseModel):
    type: Optional[ParticipationType] = None
    stat: Optional[int] = None
    real_presence: Optional[bool] = None


class LogRelations(BaseModel):
    cleanday_key: Optional[str] = None
    user_key: Optional[str] = None
    comment_key: Optional[str] = None
    location_key: Optional[str] = None


class CreateLog(BaseModel):
    date: datetime
    type: str
    description: str
    keys: LogRelations


class CreateComment(BaseModel):
    text: str
    date: datetime


class CreateImage(BaseModel):
    photo: str
    description: str
