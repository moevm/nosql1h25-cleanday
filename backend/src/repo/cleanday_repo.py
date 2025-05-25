from data.entity import CleanDay
from data.query import GetCleanday, GetCleandaysParams, GetUser, GetMembersParams, PaginationParams, CleandayLog, \
    GetComment
from repo.model import CreateCleanday, UpdateCleanday


class CleandayRepo:
    def __init__(self):
        pass

    async def get_by_id(self, cleanday_key: str) -> GetCleanday:
        pass

    async def get_page(self, params: GetCleandaysParams) -> (int, list[GetCleanday]):
        pass

    async def get_raw_by_id(self, cleanday_key: str) -> CleanDay:
        pass

    async def create(self, user_key: str, cleanday: CreateCleanday) -> CleanDay:
        pass

    async def update(self, cleanday_key: str, cleanday: UpdateCleanday) -> CleanDay:
        pass

    async def set_city(self, cleanday_key: str, city_key: str) -> bool:
        pass

    async def set_location(self, cleanday_key: str, location_key: str) -> bool:
        pass

    async def get_members(self, cleanday_key: str, params: GetMembersParams) -> (int, list[GetUser]):
        pass

    async def get_logs(self, cleanday_key: str, params: PaginationParams) -> (int, list[CleandayLog]):
        pass

    async def get_comments(self, cleanday_key: str, params: PaginationParams) -> (int, list[GetComment]):
        pass
    