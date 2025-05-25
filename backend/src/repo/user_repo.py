from auth.model import RegisterUser
from data.entity import User, Image
from data.query import GetUser, GetUsersParams, GetCleanday, PaginationParams
from repo.model import CreateUser, UpdateUser


class UserRepo:

    def __init__(self):
        pass

    async def get_by_id(self, user_key: str) -> GetUser:
        pass

    async def get_page(self, params: GetUsersParams) -> (int, list[GetUser]):
        pass

    async def get_raw_by_id(self, user_key: str) -> User:
        pass

    async def get_raw_by_login(self, login: str) -> User:
        pass

    async def create(self, user: CreateUser) -> User:
        pass

    async def update(self, user_key: str, user: UpdateUser) -> User:
        pass

    async def set_city(self, user_key: str, city_key: str) -> bool:
        pass

    async def get_cleandays(self, user_key: str, params: PaginationParams) -> (int, list[GetCleanday]):
        pass

    async def get_organized(self, user_key: str, params: PaginationParams) -> (int, list[GetCleanday]):
        pass

    async def set_image(self, user_key: str, image: Image) -> bool:
        pass
