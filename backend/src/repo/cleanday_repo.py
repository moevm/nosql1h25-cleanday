from datetime import datetime
from enum import StrEnum, auto
from typing import Optional, Tuple

from arango import cursor
from arango.database import StandardDatabase

from data.entity import CleanDay, CleanDayTag, CleanDayStatus, ParticipationType, Requirement, Image
from data.query import GetCleanday, GetCleandaysParams, GetUser, GetMembersParams, PaginationParams, CleandayLog, \
    GetComment, GetMember
from repo import util
from repo.client import database
from repo.location_repo import LocationRepo
from repo.model import CreateCleanday, UpdateCleanday, CreateImage
from repo.user_repo import setup_get_users_params


class DeleteReqResult(StrEnum):
    CLEANDAY_DOES_NOT_EXIST = auto()
    REQUIREMENT_DOES_NOT_EXIST = auto()
    CLEANDAY_DOES_NOT_MATCH = auto()
    SUCCESS = auto()


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
            """,
            bind_vars={"cleanday_key": cleanday_key}
        )

        cleanday_dict = cursor.next()
        return GetCleanday.model_validate(cleanday_dict)

    def get_page(self, params: GetCleandaysParams) -> (int, list[GetCleanday]):
        return util.get_cleanday_page(
            self.db,
            "FOR cl_day IN CleanDay",
            params
        )

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
        cleanday_dict['begin_date'] = cleanday_dict['begin_date'].isoformat()
        cleanday_dict['end_date'] = cleanday_dict['end_date'].isoformat()

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
            filters.append("    FILTER LENGTH(INTERSECTION(usr.requirement_keys, @requirements)) >= LENGTH(@requirements)")

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
                                      FILTER p.type == "Организатор"
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
                                      FILTER p.type == "Организатор"
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
                                  "requirements": requirements,
                                  "requirement_keys": requirement_keys
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
                            RETURN MERGE(usr, {password: "", key: usr._key})
                    )
                    LET comment = FIRST(
                        FOR comm IN OUTBOUND log relates_to_comment
                            LIMIT 1
                            RETURN MERGE(comm, {key: comm._key})
                    )
                    LET location = FIRST(
                        FOR loc IN OUTBOUND log relates_to_location
                            LIMIT 1
                            RETURN MERGE(loc, {key: loc._key})
                    )
                    LIMIT @offset, @limit
                    
                    RETURN MERGE(log, {
                        user: user,
                        comment: comment,
                        key: log._key,
                        location: location
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
                                    FILTER p.type == "Организатор"
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

    def create_requirement(self, cleanday_key: str, name: str) -> Optional[Requirement]:
        if self.get_raw_by_key(cleanday_key) is None:
            return None

        cursor = self.db.aql.execute(
            """
            LET cdId = CONCAT("CleanDay/", @cleanday_key)
            
            LET req = FIRST(
                INSERT {
                    name: @name
                } INTO Requirement
                RETURN NEW
            )
            
            INSERT {
                _from: cdId,
                _to: req._id
            } INTO has_requirement
            
            RETURN req
            """,
            bind_vars={'cleanday_key': cleanday_key, 'name': name}
        )

        req_dict = cursor.next()
        req_dict['key'] = req_dict['_key']

        return Requirement.model_validate(req_dict)

    def delete_requirement(self, cleanday_key: str, req_key: str) -> DeleteReqResult:
        if self.get_raw_by_key(cleanday_key) is None:
            return DeleteReqResult.CLEANDAY_DOES_NOT_EXIST

        cursor = self.db.aql.execute(
            """
            LET req = FIRST(RETURN DOCUMENT(CONCAT("Requirement/", @req_key)))
            LET cleanday = FIRST(
                FOR cd IN INBOUND req has_requirement
                    LIMIT 1
                    RETURN cd
            )
            RETURN {
                req: req,
                cleanday: cleanday
            }
            """,
            bind_vars={'req_key': req_key}
        )

        if cursor.empty():
            return DeleteReqResult.REQUIREMENT_DOES_NOT_EXIST

        req_dict = cursor.next()
        if req_dict['req'] is None:
            return DeleteReqResult.REQUIREMENT_DOES_NOT_EXIST
        if req_dict['cleanday']['_key'] != cleanday_key:
            return DeleteReqResult.CLEANDAY_DOES_NOT_MATCH

        cursor = self.db.aql.execute(
            """
            LET reqId = CONCAT("Requirement/", @req_key)
            
            FOR edge IN has_requirement
                FILTER edge._to == reqId
                REMOVE edge IN has_requirement
            """,
            bind_vars={'req_key': req_key}
        )
        self.db.aql.execute(
            """
            LET reqId = CONCAT("Requirement/", @req_key)
            
            FOR edge2 IN fullfills
                FILTER edge2._to == reqId
                REMOVE edge2 IN fullfills
            """,
            bind_vars={'req_key': req_key}
        )
        self.db.aql.execute(
            """
            LET reqId = CONCAT("Requirement/", @req_key)
            REMOVE @req_key IN Requirement
            """,
            bind_vars={'req_key': req_key}
        )

        return DeleteReqResult.SUCCESS

    def create_images(self, cleanday_key: str, image_data: list[CreateImage]) -> Optional[int]:

        if not self.get_raw_by_key(cleanday_key):
            return None

        image_data = list(map(lambda img: img.model_dump(), image_data))

        cursor = self.db.aql.execute(
            """
            RETURN COUNT(FOR image_entry IN @image_data
                LET cdId = CONCAT("CleanDay/", @cleanday_key)
                LET img = FIRST(
                  INSERT image_entry INTO Image
                  RETURN NEW
                )
    
                INSERT {
                  _from: cdId,
                  _to: img._id
                } INTO cleanday_image
                
                RETURN 1)
            """,
            bind_vars={"cleanday_key": cleanday_key, "image_data": image_data},
        )

        return cursor.next()

    def get_images(self, cleanday_key: str) -> Optional[list[Image]]:
        if not self.get_raw_by_key(cleanday_key):
            return None

        cursor = self.db.aql.execute(
            """
            LET cdId = CONCAT("CleanDay/", @cleanday_key)
            
            FOR img IN OUTBOUND cdId cleanday_image
                RETURN MERGE(img, {key: img._key})
            """,
            bind_vars={"cleanday_key": cleanday_key}
        )

        img_list = []

        for row in cursor:
            img_list.append(Image.model_validate(row))

        return img_list


if __name__ == "__main__":
    repo = CleandayRepo(database)
    print(repo.get_page(GetCleandaysParams(created_at_from=datetime.now())))
    print(repo.get_by_key('131375'))
    # print(repo.create_images('131375', [CreateImage(photo="data", description="Территория до")]))
    # print(repo.get_images('131375'))
    # print(repo.create_requirement('131375', 'Принести еду'))
    # print(repo.delete_requirement('131375', '131379'))
