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
    login: str
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
    TRASH_SORTING = "Сортировка мусора"
    PLANTING = "Посадка растений"
    FLOWER_BED_SETUP = "Разбитие клумб"
    LAWN_SETUP = "Разбитие газонов"
    WATERBODY_CLEANING = "Очистка водоемов"
    SNOW_REMOVAL = "Уборка снега"
    LEAF_CLEANING = "Уборка листьев"
    PLANT_CARE = "Уход за растениями"
    REPAIR = "Ремонт"
    PAINTING = "Покраска"
    FEEDER_INSTALLATION = "Установка кормушек"
    MASTER_CLASSES = "Мастер-классы"
    GAMES_AND_CONTESTS = "Игры и конкурсы"
    PICNIC = "Пикник"


class CleanDay(BaseModel):
    key: str
    name: str
    description: str
    recommended_count: int
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
    real_presence: bool


class City(BaseModel):
    key: str
    name: str


class Location(BaseModel):
    key: str
    address: str
    instructions: str


class Image(BaseModel):
    key: str
    description: str
    photo: str


class Log(BaseModel):
    key: str
    date: datetime
    type: str
    description: str


class Requirement(BaseModel):
    key: str
    name: str
