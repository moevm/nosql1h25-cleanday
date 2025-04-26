from datetime import datetime
from pydantic import BaseModel
from enum import StrEnum, auto


class Sex(StrEnum):
    MALE = auto()
    FEMALE = auto()
    OTHER = auto()


class User(BaseModel):
    key: str
    first_name: str
    last_name: str
    middle_name: str
    sex: Sex
    password: str
    about_me: str
    score: int
    level: int


class CleanDayStatus(StrEnum):
    PLANNED = "Запланирован"
    ONGOING = "Проходит"
    ENDED = "Завершен"
    CANCELLED = "Отменен"
    RESCHEDULED = "Перенесен"


class CleanDayTag(StrEnum):
    TRASH_COLLECTING = "Сбор мусора"
    # TODO add all values


class CleanDay(BaseModel):
    key: str
    name: str
    begin_date: datetime
    end_date: datetime
    organization: str
    area: int
    status: CleanDayStatus
    tags: list[CleanDayTag]


class Comment(BaseModel):
    key: str
    text: str
    date: datetime


class ParticipationType(StrEnum):
    WILL_GO = "Точно пойду"
    WILL_BE_LATE = "Опоздаю"
    MAYBE_WILL_GO = "Возможно, пойду"
    WILL_NOT_GO = "Не пойду"
    ORGANIZER = "Организатор"


class Participation(BaseModel):
    key: str
    type: ParticipationType
    stat: int


class City(BaseModel):
    name: str


class Location(BaseModel):
    address: str
    instructions: str


class Image(BaseModel):
    description: str
    photo: str


class Log(BaseModel):
    date: datetime
    type: str
    description: str


class Requirement(BaseModel):
    name: str
