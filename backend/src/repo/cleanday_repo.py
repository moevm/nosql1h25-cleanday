from datetime import datetime
from typing import Optional, Tuple

from arango import cursor
from arango.database import StandardDatabase

from data.entity import CleanDay, CleanDayTag, CleanDayStatus, ParticipationType, Requirement
from data.query import GetCleanday, GetCleandaysParams, GetUser, GetMembersParams, PaginationParams, CleandayLog, \
    GetComment, GetMember
from repo.client import database
from repo.location_repo import LocationRepo
from repo.model import CreateCleanday, UpdateCleanday
from repo.user_repo import setup_get_users_params

contains_filters = ['name', 'organization']

from_filters = ['begin_date_from', 'end_date_from', 'area_from', 'recommended_count_from', 'participant_count_from']
to_filters = ['begin_date_to', 'end_date_to', 'area_to', 'recommended_count_to', 'participant_count_to']


class CleandayRepo:
    def __init__(self, database: StandardDatabase):
        self.db = database
        self.loc_repo = LocationRepo(database)

    def get_by_key(self, cleanday_key: str) -> Optional[GetCleanday]:
        if self.get_raw_by_key(cleanday_key) is None:
            return None

        cursor = self.db.aql.execute(
            """
            LET cdId = CONCAT("CleanDay/", @cleanday_key)
            LET cl_day = DOCUMENT(cdId)                    
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
                    RETURN 1
            )
            
            LET requirements = (
                FOR req IN OUTBOUND cdId has_requirement 
                    LET fulfills = COUNT(
                        FOR par IN INBOUND req fullfills
                            RETURN 1
                    )
                    
                    RETURN MERGE(req, {"users_amount": fulfills, "key": req._key})    
            )
            
            RETURN MERGE(cl_day,
            {
                "key": cl_day._key,
                "city": city.name,
                "participant_count": participant_count,
                "requirements": requirements,
                "location": loc
            }
            )
            """,
            bind_vars={"cleanday_key": cleanday_key}
        )

        cleanday_dict = cursor.next()
        return GetCleanday.model_validate(cleanday_dict)

    def get_page(self, params: GetCleandaysParams) -> (int, list[GetCleanday]):
        params_dict = params.model_dump(exclude_none=True)
        filters = []
        bind_vars = {
            "offset": params.offset,
            "limit": params.limit
        }

        for contains_filter in contains_filters:
            if contains_filter in params_dict:
                filters.append(
                    f"    FILTER CONTAINS(LOWER(cleanday.{contains_filter}), LOWER(@{contains_filter}))"
                )
                bind_vars[contains_filter] = params_dict[contains_filter]

        if "status" in params_dict:
            filters.append("    FILTER cleanday.status IN @status")
            bind_vars["status"] = params_dict["status"]

        if "tags" in params_dict:
            filters.append("    FILTER cleanday.tags ANY IN @tags")
            bind_vars["tags"] = params_dict["tags"]

        for from_filter in from_filters:
            if from_filter in params_dict:
                filters.append(
                    f"    FILTER cleanday.{from_filter[:-5]} >= @{from_filter}"
                )
                bind_vars[from_filter] = params_dict[from_filter]

        for to_filter in to_filters:
            if to_filter in params_dict:
                filters.append(
                    f"    FILTER cleanday.{to_filter[:-3]} <= @{to_filter}"
                )
                bind_vars[to_filter] = params_dict[to_filter]

        query = f"""
            LET count = COUNT(
                FOR cl_day IN CleanDay
                    LET cdId = cl_day._id     
                    LET loc = FIRST(
                        FOR loc IN OUTBOUND cdId in_location
                            LIMIT 1
                            RETURN MERGE(loc, {{key: loc._key}})
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
                            RETURN 1
                    )
        
                    LET requirements = (
                        FOR req IN OUTBOUND cdId has_requirement 
                            LET fulfills = COUNT(
                                FOR par IN INBOUND req fullfills
                                    RETURN 1
                            )
        
                            RETURN MERGE(req, {{"users_amount": fulfills, "key": req._key}})    
                    )
                
                    
                    LET cleanday = MERGE(cl_day,
                    {{
                        "key": cl_day._key,
                        "city": city.name,
                        "participant_count": participant_count,
                        "requirements": requirements,
                        "location": loc
                    }})
                    
                {'\n'.join(filters)}
                    
                    RETURN cleanday
            )
            
            LET page = (
                 FOR cl_day IN CleanDay
                    LET cdId = cl_day._id     
                    LET loc = FIRST(
                        FOR loc IN OUTBOUND cdId in_location
                            LIMIT 1
                            RETURN MERGE(loc, {{key: loc._key}})
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
                            RETURN 1
                    )
        
                    LET requirements = (
                        FOR req IN OUTBOUND cdId has_requirement 
                            LET fulfills = COUNT(
                                FOR par IN INBOUND req fullfills
                                    RETURN 1
                            )
        
                            RETURN MERGE(req, {{"users_amount": fulfills, "key": req._key}})    
                    )
                
                    
                    LET cleanday = MERGE(cl_day,
                    {{
                        "key": cl_day._key,
                        "city": city.name,
                        "participant_count": participant_count,
                        "requirements": requirements,
                        "location": loc
                    }})
                    
                {'\n'.join(filters)}
                
                    SORT cleanday.{params.sort_by} {params.sort_order}
                    LIMIT @offset, @limit
                    
                    RETURN cleanday           
            )
            
            RETURN {{
                    "page": page,
                    "count": count
                    }}
            """

        print(query)

        cursor = self.db.aql.execute(query, bind_vars=bind_vars)
        result_dict = cursor.next()

        cleanday_page = list(map(lambda c: GetCleanday.model_validate(c), result_dict["page"]))

        return result_dict["count"], cleanday_page

    def get_raw_by_key(self, cleanday_key: str) -> Optional[CleanDay]:
        cursor = self.db.aql.execute(
            """
            RETURN DOCUMENT(CONCAT("CleanDay/", @cleanday_key))
            """,
            bind_vars={"cleanday_key": cleanday_key}
        )

        result_dict = cursor.next()

        if result_dict is None:
            return None

        result_dict['key'] = result_dict["_key"]
        return CleanDay.model_validate(result_dict)

    def create(self, user_key: str, cleanday: CreateCleanday) -> CleanDay:
        cleanday_dict = cleanday.model_dump()
        cleanday_dict.pop('requirements')
        cleanday_dict['begin_date'] = str(cleanday_dict['begin_date'])
        cleanday_dict['end_date'] = str(cleanday_dict['end_date'])

        cursor = self.db.aql.execute(
            """
            LET cleanday = FIRST(
                INSERT @cleanday INTO CleanDay
                RETURN NEW
            )
            
            LET userId = CONCAT("User/", @user_key)
            
            LET par = FIRST(
              INSERT {
              type: 'Организатор',
              stat: 0,
              real_presence: false
              } INTO Participation
              RETURN NEW
            )
            
            INSERT {
              _from: userId,
              _to: par._id
            } INTO has_participation
            
            INSERT {
              _from: par._id,
              _to: cleanday._id
            } INTO participation_in
            
            LET reqs = (
                FOR req_name IN @req_names
                    LET req = FIRST(
                        INSERT {
                            name: req_name
                        } INTO Requirement
                        RETURN NEW
                    )
                    INSERT {
                        _from: cleanday._id,
                        _to: req._id
                    } INTO has_requirement
                    RETURN req
                )
                
            RETURN cleanday
            """,
            bind_vars={"cleanday": cleanday_dict, "user_key": user_key, "req_names": cleanday.requirements}
        )

        result_dict = cursor.next()
        result_dict['key'] = result_dict["_key"]

        return CleanDay.model_validate(result_dict)

    def update(self, cleanday_key: str, cleanday: UpdateCleanday) -> Optional[CleanDay]:
        if self.get_raw_by_key(cleanday_key) is None:
            return None

        cursor = self.db.aql.execute(
            """
            UPDATE @cleanday_key WITH @changes IN CleanDay
            RETURN NEW
            """,
            bind_vars={"cleanday_key": cleanday_key, "changes": cleanday.model_dump(exclude_none=True)},
        )

        result_dict = cursor.next()
        result_dict['key'] = result_dict["_key"]

        return CleanDay.model_validate(result_dict)

    def set_location(self, cleanday_key: str, location_key: str) -> bool:
        if self.get_raw_by_key(cleanday_key) is None:
            return False

        if self.loc_repo.get_raw_by_key(location_key) is None:
            return False

        self.db.aql.execute(
            """
            LET cdId = CONCAT("CleanDay/", @cleanday_key)

            FOR edge IN in_location
              FILTER edge._from == cdId
              REMOVE edge IN in_location
            """, bind_vars={"cleanday_key": cleanday_key}
        )

        self.db.aql.execute(
            """
            LET cdId = CONCAT("CleanDay/", @cleanday_key)
            LET locId = CONCAT("Location/", @loc_id)

            INSERT {
              _from: cdId,
              _to: locId
            } INTO in_location
            """, bind_vars={"cleanday_key": cleanday_key, "loc_id": location_key}
        )

        return True

    def get_members(self, cleanday_key: str, params: GetMembersParams) -> Optional[Tuple[int, list[GetMember]]]:
        if self.get_raw_by_key(cleanday_key) is None:
            return None

        bind_vars, filters = setup_get_users_params(params)
        bind_vars["cleanday_key"] = cleanday_key

        if params.participation_type:
            bind_vars["participation_type"] = params.participation_type
            filters.append("    FILTER usr.participation_type IN @participation_type")

        if params.requirements:
            bind_vars["requirements"] = params.requirements
            filters.append("    FILTER LENGTH(INTERSECTION(usr.requirements, @requirements)) == LENGTH(@requirements)")

        query = f"""
                    LET cdId = CONCAT("CleanDay/", @cleanday_key)
                    LET cleanday_reqs = (
                                        FOR r IN OUTBOUND cdId has_requirement
                                          RETURN r._id
                                      )
                    LET count = COUNT(
                        FOR par IN INBOUND cdId participation_in           
                            FOR u IN INBOUND par has_participation
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
    
                                LET requirements = (
                                    FOR req IN OUTBOUND par._id fullfills
                                      FILTER req._id IN cleanday_reqs
                                      RETURN MERGE(req, {{"key": req._key}})
                                )
                                
                                LET usr = MERGE(u, {{
                                  "key": u._key,
                                  "city": city.name,
                                  "cleanday_count": parCount,
                                  "organized_count": orgCount,
                                  "stat": stat,
                                  "participation_type": par.type,
                                  "requirements": requirements
                                }})
    
                            {'\n'.join(filters)}
    
                                RETURN usr
                    )

                    LET page = (
                        FOR par IN INBOUND cdId participation_in 
                            LIMIT @offset, @limit          
                            FOR u IN INBOUND par has_participation
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
                                
                                LET requirements = (
                                    FOR req IN OUTBOUND par._id fullfills
                                      FILTER req._id IN cleanday_reqs
                                      RETURN MERGE(req, {{"key": req._key}})
                                )
                                
                                LET requirement_keys = (
                                    FOR req IN OUTBOUND par._id fullfills
                                      FILTER req._id IN cleanday_reqs
                                      RETURN req._key
                                )
                                
                                LET usr = MERGE(u, {{
                                  "key": u._key,
                                  "city": city.name,
                                  "cleanday_count": parCount,
                                  "organized_count": orgCount,
                                  "stat": stat,
                                  "participation_type": par.type,
                                  "requirements": requirements
                                }})
        
                            {'\n'.join(filters)}
        
                                SORT usr.{params.sort_by} {params.sort_order}     /* see next section */
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
        return page_dict["count"], list(map(lambda u: GetMember.model_validate(u), page_dict["page"]))
        pass

    def get_logs(self, cleanday_key: str, params: PaginationParams) -> Optional[Tuple[int, list[CleandayLog]]]:
        if self.get_raw_by_key(cleanday_key) is None:
            return None

        bind_vars = params.model_dump()
        bind_vars["cleanday_key"] = cleanday_key

        cursor = self.db.aql.execute(
            """
            LET cdId = CONCAT("CleanDay/", @cleanday_key)
            
            LET count = COUNT(
                FOR log IN INBOUND cdId relates_to_cleanday
                    RETURN 1
            )
            
            LET page = (
                FOR log IN INBOUND cdId relates_to_cleanday
                    SORT log.date
                    
                    LET user = FIRST(
                        FOR usr IN OUTBOUND log relates_to_user
                            LIMIT 1
                            RETURN usr
                    )
                    LET comment = FIRST(
                        FOR comm IN OUTBOUND log relates_to_comment
                            LIMIT 1
                            RETURN comm
                    )
                    LIMIT @offset, @limit
                    
                    RETURN MERGE(log, {
                        user: MERGE(user, {key: user._key}),
                        comment: comment,
                        key: log._key
                    })
            )
            
            RETURN {
                page: page,
                count: count
            }
            """,
            bind_vars=bind_vars
        )

        result_dict = cursor.next()
        print(result_dict["page"])
        page = list(map(lambda c: CleandayLog.model_validate(c), result_dict["page"]))
        return result_dict["count"], page

    def get_comments(self, cleanday_key: str, params: PaginationParams) -> Optional[Tuple[int, list[GetComment]]]:
        if self.get_raw_by_key(cleanday_key) is None:
            return None

        bind_vars = params.model_dump()
        bind_vars["cleanday_key"] = cleanday_key

        cursor = self.db.aql.execute(
            """
            LET cdId = CONCAT("CleanDay/", @cleanday_key)
            LET count = COUNT(
                FOR comment IN OUTBOUND cdId has_comment
                    RETURN 1
            )
            LET page = (
                FOR comment IN OUTBOUND cdId has_comment
                    SORT comment.time DESC
                    LIMIT @offset, @limit
                    LET user = FIRST(
                        FOR par IN INBOUND comment._id authored
                            FOR u IN INBOUND par has_participation
                              LIMIT 1
                              LET city = FIRST(
                                  FOR city IN OUTBOUND u._id lives_in
                                    LIMIT 1
                                    RETURN city
                              )
                              
                              LET parCount = COUNT(
                                  FOR p IN OUTBOUND u._id has_participation
                                    FOR cl_day IN OUTBOUND p participation_in
                                      RETURN cl_day
                              )
                              
                              LET orgCount = COUNT(
                                  FOR p IN OUTBOUND u._id has_participation
                                    FILTER p.type == "organiser"
                                    FOR cl_day IN OUTBOUND p participation_in
                                      RETURN cl_day
                              )
                              
                              LET stat = SUM(
                                  FOR p IN OUTBOUND u._id has_participation
                                        RETURN p.stat
                              )
                              RETURN MERGE(u, {
                                "key": u._key,
                                "city": city.name,
                                "cleanday_count": parCount,
                                "organized_count": orgCount,
                                "stat": stat
                              })
                    )
                    RETURN MERGE(comment, {"author": user, key: comment._key})
            )
            
            RETURN {
                page: page,
                count: count
            }
            """,
            bind_vars=bind_vars
        )

        result_dict = cursor.next()
        print(result_dict["page"])
        page = list(map(lambda c: GetComment.model_validate(c), result_dict["page"]))
        return result_dict["count"], page

    def get_raw_requirements(self, cleanday_key: str) -> Optional[list[Requirement]]:
        if self.get_raw_by_key(cleanday_key) is None:
            return None

        cursor = self.db.aql.execute(
            """
            LET cdId = CONCAT("CleanDay/", @cleanday_key)
            
            FOR req IN OUTBOUND cdId has_requirement 
                RETURN MERGE(req, {"key": req._key}) 
            """,
            bind_vars={'cleanday_key': cleanday_key}
        )

        result_list = []

        for row in cursor:
            result_list.append(Requirement.model_validate(row))

        return result_list

if __name__ == "__main__":
    repo = CleandayRepo(database)

    print(repo.get_by_key('1778'))