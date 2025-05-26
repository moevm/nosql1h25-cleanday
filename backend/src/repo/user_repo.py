from arango.database import StandardDatabase

from auth.model import RegisterUser
from data.entity import User, Image, Sex
from data.query import GetUser, GetUsersParams, GetCleanday, PaginationParams, UserSortField
from repo.client import database
from repo.model import CreateUser, UpdateUser

contains_filters = ['first_name', 'last_name', 'login', 'city']
from_filters = ['level_from', 'cleandays_from', 'organized_from', 'stat_from']
to_filters = ['level_to', 'cleandays_to', 'organized_to', 'stat_to']

filter_fields = {
    'level_from': 'level',
    'cleandays_from': 'cleanday_count',
    'organized_from': 'organized_count',
    'stat_from': 'stat',
    'level_to': 'level',
    'cleandays_to': 'cleanday_count',
    'organized_to': 'organized_count',
    'stat_to': 'stat'
}


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

        params_dict = params.model_dump(exclude_none=True)
        filters = []
        bind_vars = {
            "offset": params.offset,
            "limit": params.limit
        }

        for contains_filter in contains_filters:
            if contains_filter in params_dict:
                filters.append(
                    f"    FILTER CONTAINS(LOWER(usr.{contains_filter}), LOWER(@{contains_filter}))"
                )
                bind_vars[contains_filter] = params_dict[contains_filter]

        if "sex" in params_dict:
            filters.append("    FILTER usr.sex IN @sex")
            bind_vars["sex"] = params_dict["sex"]

        for from_filter in from_filters:
            if from_filter in params_dict:
                filters.append(
                    f"    FILTER usr.{filter_fields[from_filter]} >= @{from_filter}"
                )
                bind_vars[from_filter] = params_dict[from_filter]

        for to_filter in to_filters:
            if to_filter in params_dict:
                filters.append(
                    f"    FILTER u.{filter_fields[to_filter]} >= @{to_filter}"
                )
                bind_vars[to_filter] = params_dict[to_filter]

        query = f"""
                LET count = COUNT(
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
                        
                        LET usr = MERGE(u, {{
                          "key": u._key,
                          "city": city.name,
                          "cleanday_count": parCount,
                          "organized_count": orgCount,
                          "stat": stat
                        }})
                        
                    {'\n'.join(filters)}
                        
                        RETURN usr
                )
                
                LET page = (FOR u in User
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
                    
                    LET usr = MERGE(u, {{
                      "key": u._key,
                      "city": city.name,
                      "cleanday_count": parCount,
                      "organized_count": orgCount,
                      "stat": stat
                    }})
                    
                {'\n'.join(filters)}
                    
                    SORT usr.{params.sort_by} {params.sort_order}     /* see next section */
                    LIMIT @offset, @limit
                    RETURN usr
                )
                
                RETURN {{
                    "page": page,
                    "count": count
                }}
            """

        print(query)

        cursor = self.db.aql.execute(query, bind_vars=bind_vars)

        page_dict = cursor.next()
        return page_dict["count"], list(map(lambda u: GetUser.model_validate(u), page_dict["page"]))

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

    def get_raw_by_login(self, login: str) -> User:
        pass

    def create(self, user: CreateUser) -> User:
        cursor = self.db.aql.execute(
            """
            INSERT {
              first_name: @first_name,
              last_name: @last_name,
              login: @login,
              sex: @sex,
              password: @password,
              about_me: @about_me,
              score: @score
            } INTO User
            RETURN NEW
            """, bind_vars=user.model_dump()
        )

        user_dict = cursor.next()
        user_dict['key'] = user_dict['_key']

        return User.model_validate(user_dict)

    def update(self, user_key: str, user: UpdateUser) -> User:
        pass

    def set_city(self, user_key: str, city_key: str) -> bool:
        self.db.aql.execute(
            """
            LET userId = CONCAT("User/", @user_id)
            LET cityId = CONCAT("City/", @city_id)
            
            FOR edge IN lives_in
              FILTER edge._from == userId
              REMOVE edge IN lives_in
            """, bind_vars={"user_id": user_key, "city_id": city_key}
        )

        self.db.aql.execute(
            """
            LET userId = CONCAT("User/", @user_id)
            LET cityId = CONCAT("City/", @city_id)
            
            INSERT {
              _from: userId,
              _to: cityId
            } INTO lives_in
            """, bind_vars={"user_id": user_key, "city_id": city_key}
        )

    def get_cleandays(self, user_key: str, params: PaginationParams) -> (int, list[GetCleanday]):
        pass

    def get_organized(self, user_key: str, params: PaginationParams) -> (int, list[GetCleanday]):
        pass

    def set_image(self, user_key: str, image: Image) -> bool:
        pass


if __name__ == "__main__":
    repo = UserRepo(database)

    print(repo.get_page(
        GetUsersParams(
            sort_by=UserSortField.CLEANDAY_COUNT,
            sort_order="asc",
            limit=1
        )
    ))
    # print(repo.create(
    #     CreateUser(
    #         first_name="Маргарита",
    #         last_name="Иванова",
    #         login="pitatir",
    #         sex=Sex.FEMALE,
    #         password="12345678",
    #         about_me="с каждым днем я становлюсь чуточку смешнее и нестабильнее",
    #         score=0
    #     )
    # ))
    # repo.set_city("51554", "1355")
