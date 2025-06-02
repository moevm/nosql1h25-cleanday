from typing import Optional, Tuple

from arango.cursor import Cursor
from arango.database import StandardDatabase

from auth.model import RegisterUser
from data.entity import User, Image, Sex
from data.query import GetUser, GetUsersParams, GetCleanday, PaginationParams, UserSortField, GetExtendedUser
from repo.city_repo import CityRepo
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


def setup_get_users_params(params: GetUsersParams) -> (dict, list[str]):
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
                f"    FILTER usr.{filter_fields[to_filter]} <= @{to_filter}"
            )
            bind_vars[to_filter] = params_dict[to_filter]

    return bind_vars, filters


class UserRepo:

    def __init__(self, database: StandardDatabase):
        self.db = database
        self.city_repo = CityRepo(database)

    def get_by_key(self, user_key: str) -> Optional[GetExtendedUser]:
        if not self.get_raw_by_key(user_key):
            return None

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
                  FILTER p.type == "Организатор"
                  FOR cl_day IN OUTBOUND p participation_in
                    RETURN cl_day
            )
            
            LET stat = SUM(
                FOR p IN OUTBOUND userId has_participation
                      RETURN p.stat
            )
            
            LET created_at = FIRST(
                FOR log IN INBOUND userId relates_to_user
                    FILTER log.type == "CreateUser"
                    LIMIT 1
                    RETURN log.date
            )
            
            LET updated_at = NOT_NULL(FIRST(
                FOR log IN INBOUND userId relates_to_user
                    FILTER log.type == "UpdateUser"
                    SORT log.date DESC
                    LIMIT 1
                    RETURN log.date
            ), created_at)
            
            
            RETURN MERGE(user, {
              "key": @id,
              "city": city.name,
              "cleanday_count": parCount,
              "organized_count": orgCount,
              "stat": stat,
              "created_at": created_at,
              "updated_at": updated_at
            })
            """, bind_vars={"id": user_key}
        )

        data_dict = cursor.next()

        return GetExtendedUser.model_validate(data_dict)

    def get_page(self, params: GetUsersParams) -> (int, list[GetUser]):

        bind_vars, filters = setup_get_users_params(params)

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
                              FILTER p.type == "Организатор"
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
                          FILTER p.type == "Организатор"
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

    def _return_single(self, cursor: Cursor) -> Optional[User]:
        user_dict = cursor.next()
        if user_dict is None:
            return None
        user_dict['key'] = user_dict['_key']

        return User.model_validate(user_dict)

    def get_raw_by_key(self, user_key: str) -> Optional[User]:

        cursor = self.db.aql.execute(
            """
            RETURN DOCUMENT(CONCAT("User/", @id))
            """, bind_vars={"id": user_key}
        )

        return self._return_single(cursor)

    def get_raw_by_login(self, login: str) -> Optional[User]:

        cursor = self.db.aql.execute(
            """
            FOR u in User
              FILTER u.login == @login
              RETURN u
            """, bind_vars={"login": login}
        )

        if cursor.empty():
            return None

        user_dict = cursor.next()
        user_dict['key'] = user_dict['_key']

        return User.model_validate(user_dict)

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

        return self._return_single(cursor)

    def update(self, user_key: str, user: UpdateUser) -> Optional[User]:
        if not self.get_raw_by_key(user_key):
            return None

        cursor = self.db.aql.execute(
            """
            UPDATE @user_key WITH @changes IN User
            RETURN NEW
            """,
            bind_vars={"user_key": user_key, "changes": user.model_dump(exclude_none=True)},
        )

        return self._return_single(cursor)

    def set_city(self, user_key: str, city_key: str) -> bool:
        if not self.get_raw_by_key(user_key):
            return False

        if not self.city_repo.get_by_key(city_key):
            return False

        self.db.aql.execute(
            """
            LET userId = CONCAT("User/", @user_id)
            
            FOR edge IN lives_in
              FILTER edge._from == userId
              REMOVE edge IN lives_in
            """, bind_vars={"user_id": user_key}
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
        return True

    def get_cleandays(self, user_key: str, params: PaginationParams) -> Optional[Tuple[int, list[GetCleanday]]]:
        if not self.get_raw_by_key(user_key):
            return None

        cursor = self.db.aql.execute(
            """
            LET userId = CONCAT("User/", @user_key)
            
            LET cd_count = COUNT(
                FOR p IN OUTBOUND userId has_participation
                    FOR cl_day IN OUTBOUND p participation_in
                        RETURN 1
            )
            
            LET cleandays = (
                FOR p IN OUTBOUND userId has_participation
                    FOR cl_day IN OUTBOUND p participation_in
                        LET cdId = cl_day._id
                        
                        LIMIT @offset, @limit
                        
                        LET loc = FIRST(
                            FOR loc IN OUTBOUND cdId in_location
                                LIMIT 1
                                RETURN MERGE(loc, {key: loc._key})
                        )
                        
                        LET city = FIRST(
                            FOR city IN OUTBOUND loc in_city
                              LIMIT 1
                              RETURN city
                        )
                        
                        LET participant_count = COUNT(
                            FOR par IN INBOUND cdId participation_in
                              FOR user IN INBOUND par has_participation
                                LIMIT 1
                                RETURN user
                        )
                        
                        LET requirements = (
                            FOR req IN OUTBOUND cdId has_requirement 
                                LET fulfills = COUNT(
                                    FOR par IN INBOUND req fullfills
                                        RETURN 1
                                )
                                
                                RETURN MERGE(req, {"users_amount": fulfills, "key": req._key})    
                        )
                        
                        LET created_at = FIRST(
                            FOR log IN INBOUND cdId relates_to_cleanday
                                FILTER log.type == "CreateCleanday"
                                LIMIT 1
                                RETURN log.date
                        )
                        
                        LET updated_at = NOT_NULL(FIRST(
                            FOR log IN INBOUND cdId relates_to_cleanday
                                FILTER log.type == "UpdateCleanday"
                                SORT log.date DESC
                                LIMIT 1
                                RETURN log.date
                        ), created_at)
                        
                        LET organizer = FIRST(
                            FOR par IN INBOUND cdId participation_in
                                FILTER par.type == "Организатор"
                                LIMIT 1
                                FOR user IN INBOUND par has_participation
                                    RETURN user.login
                        )
                        
                        LET organizer_key = FIRST(
                            FOR par IN INBOUND cdId participation_in
                                FILTER par.type == "Организатор"
                                LIMIT 1
                                FOR user IN INBOUND par has_participation
                                    RETURN user._key
                        )
                        
                        RETURN MERGE(cl_day,
                        {
                            "key": cl_day._key,
                            "city": city.name,
                            "participant_count": participant_count,
                            "requirements": requirements,
                            "location": loc,
                            "created_at": created_at,
                            "updated_at": updated_at,
                            "organizer": organizer,
                            "organizer_key": organizer_key
                        }
                        )
            )
            RETURN {
                "cleandays": cleandays,
                "count": cd_count
            }
            """,
            bind_vars={"user_key": user_key, "offset": params.offset, "limit": params.limit},
        )
        result_dict = cursor.next()
        cleandays = list(map(lambda cd: GetCleanday.model_validate(cd), result_dict["cleandays"]))

        return result_dict["count"], cleandays

    def get_organized(self, user_key: str, params: PaginationParams) -> Optional[Tuple[int, list[GetCleanday]]]:
        if not self.get_raw_by_key(user_key):
            return None

        cursor = self.db.aql.execute(
            """
            LET userId = CONCAT("User/", @user_key)

            LET cd_count = COUNT(
                FOR p IN OUTBOUND userId has_participation
                    FOR cl_day IN OUTBOUND p participation_in
                        FILTER p.type == "Организатор"
                        RETURN 1
            )

            LET cleandays = (
                FOR p IN OUTBOUND userId has_participation
                    FOR cl_day IN OUTBOUND p participation_in
                        FILTER p.type == "Организатор"
                        LET cdId = cl_day._id

                        LIMIT @offset, @limit

                        LET loc = FIRST(
                            FOR loc IN OUTBOUND cdId in_location
                                LIMIT 1
                                RETURN MERGE(loc, {key: loc._key})
                        )
                        
                        LET city = FIRST(
                            FOR city IN OUTBOUND loc in_city
                              LIMIT 1
                              RETURN city
                        )

                        LET participant_count = COUNT(
                            FOR par IN INBOUND cdId participation_in
                              FOR user IN INBOUND par has_participation
                                LIMIT 1
                                RETURN user
                        )

                        LET requirements = (
                            FOR req IN OUTBOUND cdId has_requirement 
                                LET fulfills = COUNT(
                                    FOR par IN INBOUND req fullfills
                                        RETURN 1
                                )

                                RETURN MERGE(req, {"users_amount": fulfills, "key": req._key})    
                        )
                        LET created_at = FIRST(
                            FOR log IN INBOUND cdId relates_to_cleanday
                                FILTER log.type == "CreateCleanday"
                                LIMIT 1
                                RETURN log.date
                        )
                        
                        LET updated_at = NOT_NULL(FIRST(
                            FOR log IN INBOUND cdId relates_to_cleanday
                                FILTER log.type == "UpdateCleanday"
                                SORT log.date DESC
                                LIMIT 1
                                RETURN log.date
                        ), created_at)
                        
                        LET organizer = FIRST(
                            FOR par IN INBOUND cdId participation_in
                                FILTER par.type == "Организатор"
                                LIMIT 1
                                FOR user IN INBOUND par has_participation
                                    RETURN user.login
                        )
                        LET organizer_key = FIRST(
                            FOR par IN INBOUND cdId participation_in
                                FILTER par.type == "Организатор"
                                LIMIT 1
                                FOR user IN INBOUND par has_participation
                                    RETURN user._key
                        )
                        
                        RETURN MERGE(cl_day,
                        {
                            "key": cl_day._key,
                            "city": city.name,
                            "participant_count": participant_count,
                            "requirements": requirements,
                            "location": loc,
                            "created_at": created_at,
                            "updated_at": updated_at,
                            "organizer": organizer,
                            "organizer_key": organizer_key
                        }
                        )
            )
            RETURN {
                "cleandays": cleandays,
                "count": cd_count
            }
            """,
            bind_vars={"user_key": user_key, "offset": params.offset, "limit": params.limit},
        )
        result_dict = cursor.next()
        cleandays = list(map(lambda cd: GetCleanday.model_validate(cd), result_dict["cleandays"]))

        return result_dict["count"], cleandays
        pass

    def set_image(self, user_key: str, image_data: str):
        if not self.get_raw_by_key(user_key):
            return False

        self.db.aql.execute(
            """
            LET userId = CONCAT("User/", @user_id)

            FOR file IN 1..1 OUTBOUND userId user_avatar
              UPDATE file WITH {
                photo: @file
              } IN Image
              RETURN NEW
            """, bind_vars={"user_id": user_key, "file": image_data}
        )
        return True

    def create_image(self, user_key: str, image_data: str):

        if not self.get_raw_by_key(user_key):
            return

        self.db.aql.execute(
            """
            LET img = FIRST(
              INSERT {
                description: "avatar",
                photo: @file
              } INTO Image
              RETURN NEW
            )
            
            INSERT {
              _from: CONCAT("User/", @user_key),
              _to: img._id
            } INTO user_avatar
            """,
            bind_vars={"user_key": user_key, "file": image_data},
        )

    def get_image(self, user_key: str) -> Optional[Image]:

        if not self.get_raw_by_key(user_key):
            return None

        cursor = self.db.aql.execute(
            """
            LET userId = CONCAT("User/", @user_key)
            
            FOR file IN OUTBOUND userId user_avatar
              LIMIT 1
              RETURN file
            """,
            bind_vars={"user_key": user_key},
        )

        if cursor.empty():
            return None

        result_dict = cursor.next()
        result_dict['key'] = result_dict['_key']

        return Image.model_validate(result_dict)


if __name__ == "__main__":
    repo = UserRepo(database)
    print(repo.get_organized('1088', PaginationParams()))
    print(repo.get_raw_by_key('04'))
    print(repo.get_by_key('1088'))
