from pydantic import BaseModel

from data.entity import Sex


class RegisterUser(BaseModel):
    first_name: str
    last_name: str
    login: str
    sex: Sex
    password: str
    city_id: str


class LoginUser(BaseModel):
    login: str
    password: str


class Token(BaseModel):
    access_token: str
