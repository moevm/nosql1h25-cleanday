from arango.database import StandardDatabase

from auth.model import RegisterUser
from data.entity import User, Image
from data.query import GetUser, GetUsersParams, GetCleanday, PaginationParams
from repo.client import database
from repo.model import CreateUser, UpdateUser


class UserRepo:

    def __init__(self, database: StandardDatabase):
        self.db = database

    def get_by_id(self, user_key: str) -> GetUser:
        cursor = self.db.aql.execute(
            """
            LET user = FIRST(
                FOR u in User
                  FILTER u._key == @id
                  RETURN u
            )
            LET userId = CONCAT("User/", @id)

            LET city = FIRST(
                FOR city IN OUTBOUND userId lives_in
                  LIMIT 1
                  RETURN city
            )
            
            LET parCount = COUNT(
                FOR p IN OUTBOUND userId has_participation
                  FOR cl_day IN OUTBOUND p participation_in
                    RETURN cl_day
            )
            
            LET orgCount = COUNT(
                FOR p IN OUTBOUND userId has_participation
                  FILTER p.type == "organiser"
                  FOR cl_day IN OUTBOUND p participation_in
                    RETURN cl_day
            )
            
            LET stat = SUM(
                FOR p IN OUTBOUND userId has_participation
                      RETURN p.stat
            )
            RETURN MERGE(user, {
              "key": @id,
              "city": city.name,
              "cleanday_count": parCount,
              "organized_count": orgCount,
              "stat": stat
            })
            """, bind_vars={"id": user_key}
        )

        data_dict = cursor.next()

        return GetUser.model_validate(data_dict)

    def get_page(self, params: GetUsersParams) -> (int, list[GetUser]):
        cursor = self.db.aql.execute(
            """
            FOR u in User
                LET userId = CONCAT("User/", u._key)
    
                LET city = FIRST(
                    FOR city IN OUTBOUND userId lives_in
                      LIMIT 1
                      RETURN city
                )
    
                LET parCount = COUNT(
                    FOR p IN OUTBOUND userId has_participation
                      FOR cl_day IN OUTBOUND p participation_in
                        RETURN cl_day
                )
    
                LET orgCount = COUNT(
                    FOR p IN OUTBOUND userId has_participation
                      FILTER p.type == "organiser"
                      FOR cl_day IN OUTBOUND p participation_in
                        RETURN cl_day
                )
    
                LET stat = SUM(
                    FOR p IN OUTBOUND userId has_participation
                          RETURN p.stat
                )
                
                LET usr = MERGE(u, {
                  "key": u._key,
                  "city": city.name,
                  "cleanday_count": parCount,
                  "organized_count": orgCount,
                  "stat": stat
                })
                
                FILTER usr.level >= 2
                
                RETURN usr
            """
        )

        users = []
        for user_dict in cursor:
            users.append(GetUser.model_validate(user_dict))
        return len(users), users

    def get_raw_by_id(self, user_key: str) -> User:

        cursor = self.db.aql.execute(
            """
            FOR u in User
              FILTER u._key == @id
              RETURN u
            """, bind_vars={"id": user_key}
        )
        user_dict = cursor.next()
        user_dict['key'] = user_dict['_key']

        return User.model_validate(user_dict)

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


if __name__ == "__main__":
    repo = UserRepo(database)

    print(repo.get_page(None))
