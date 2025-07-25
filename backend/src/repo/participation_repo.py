from datetime import datetime
from enum import Enum, StrEnum, auto
from typing import Optional, Tuple

from arango.database import StandardDatabase

from data.entity import Participation, ParticipationType, Comment
from repo.cleanday_repo import CleandayRepo
from repo.client import database
from repo.model import UpdateParticipation, CreateComment
from repo.user_repo import UserRepo


class CreateResult(StrEnum):
    CREATED = auto()
    USER_DOES_NOT_EXIST = auto()
    CLEANDAY_DOES_NOT_EXIST = auto()
    PARTICIPATION_ALREADY_EXISTS = auto()


class SetReqResult(StrEnum):
    SUCCESS = auto()
    PARTICIPATION_DOES_NOT_EXIST = auto()
    REQUIREMENT_DOES_NOT_EXIST = auto()


class ParticipationRepo:
    def __init__(self, database: StandardDatabase):
        self.db = database
        self.user_repo = UserRepo(database)
        self.cleanday_repo = CleandayRepo(database)

    def get(self, user_key: str, cleanday_key: str) -> Optional[Participation]:
        if self.user_repo.get_raw_by_key(user_key) is None:
            return None
        if self.cleanday_repo.get_raw_by_key(cleanday_key) is None:
            return None

        cursor = self.db.aql.execute(
            """
            LET userId = CONCAT("User/", @user_key)
            LET cleanDayId = CONCAT("CleanDay/", @cleanday_key)
            
            FOR par IN OUTBOUND userId has_participation
              LET cleanday = FIRST(
                FOR cd IN OUTBOUND par participation_in
                  LIMIT 1
                  RETURN cd
              )
              FILTER cleanday._id == cleanDayId
              RETURN par
            """,
            bind_vars={"user_key": user_key, "cleanday_key": cleanday_key}
        )

        if cursor.empty():
            return None

        par_dict = cursor.next()
        par_dict['key'] = par_dict['_key']

        return Participation.model_validate(par_dict)

    def create(self, user_key: str, cleanday_key: str, par_type: ParticipationType) \
            -> Tuple[CreateResult, Optional[Participation]]:
        if self.user_repo.get_raw_by_key(user_key) is None:
            return CreateResult.USER_DOES_NOT_EXIST, None
        if self.cleanday_repo.get_raw_by_key(cleanday_key) is None:
            return CreateResult.CLEANDAY_DOES_NOT_EXIST, None

        if self.get(user_key, cleanday_key) is not None:
            return CreateResult.PARTICIPATION_ALREADY_EXISTS, None

        cursor = self.db.aql.execute(
            """
            LET userId = CONCAT("User/", @user_key)
            LET cleanDayId = CONCAT("CleanDay/", @cleanday_key)
            
            LET par = FIRST(
              INSERT {
              type: @par_type,
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
              _to: cleanDayId
            } INTO participation_in
            
            RETURN par
            """,
            bind_vars={'user_key': user_key, 'cleanday_key': cleanday_key, 'par_type': par_type}
        )

        par_dict = cursor.next()
        par_dict['key'] = par_dict['_key']

        return CreateResult.CREATED, Participation.model_validate(par_dict)

    def update(self, user_key: str, cleanday_key: str, par: UpdateParticipation) -> Optional[Participation]:
        participation = self.get(user_key, cleanday_key)

        if participation is None:
            return None

        cursor = self.db.aql.execute(
            """
            LET parId = CONCAT("Participation/", @par_key)
            
            FOR par IN Participation
                FILTER par._id == parId
                UPDATE par WITH @data IN Participation
                RETURN NEW
            """,
            bind_vars={"par_key": participation.key, "data": par.model_dump(exclude_none=True)}
        )

        if cursor.empty():
            return None

        par_dict = cursor.next()
        par_dict['key'] = par_dict['_key']

        return Participation.model_validate(par_dict)

    def set_requirements(self, user_key: str, cleanday_key: str, requirement_keys: list[str]) -> SetReqResult:
        participation = self.get(user_key, cleanday_key)

        if participation is None:
            return SetReqResult.PARTICIPATION_DOES_NOT_EXIST

        requirements = self.cleanday_repo.get_raw_requirements(cleanday_key)
        existing_req_keys = set(map(lambda req: req.key, requirements))

        print(existing_req_keys)

        for key in requirement_keys:
            if key not in existing_req_keys:
                return SetReqResult.REQUIREMENT_DOES_NOT_EXIST

        cursor = self.db.aql.execute(
            """
            LET parId = CONCAT("Participation/", @par_key)
            
            FOR edge IN fullfills
                FILTER edge._from == parId
                REMOVE edge IN fullfills
            
            
            """,
            bind_vars={"par_key": participation.key}
        )

        self.db.aql.execute(
            """
            LET parId = CONCAT("Participation/", @par_key)
            
            FOR key IN @req_keys
                LET reqId = CONCAT("Requirement/", key)
                INSERT {
                    _from: parId,
                    _to: reqId
                } INTO fullfills
                RETURN NEW
            """,
            bind_vars={"par_key": participation.key, "req_keys": requirement_keys}
        )

        return SetReqResult.SUCCESS

    def get_requirements(self, user_key: str, cleanday_key: str) -> Optional[list[str]]:
        participation = self.get(user_key, cleanday_key)

        if participation is None:
            return None

        cursor = self.db.aql.execute(
            """
            LET parId = CONCAT("Participation/", @par_key)
            
            FOR req IN OUTBOUND parId fullfills
                RETURN req._key
            """,
            bind_vars={"par_key": participation.key}
        )

        req_list = []

        for req in cursor:
            req_list.append(req)

        return req_list

    def create_comment(self, user_key: str, cleanday_key: str, comment: CreateComment) -> Optional[Comment]:
        if self.cleanday_repo.get_raw_by_key(cleanday_key) is None:
            return None
        if self.user_repo.get_raw_by_key(user_key) is None:
            return None

        participation = self.get(user_key, cleanday_key)

        if participation is None:
            return None

        comm_data = comment.model_dump(exclude_none=True)
        comm_data['date'] = comm_data['date'].isoformat()

        cursor = self.db.aql.execute(
            """
            LET cdId = CONCAT("CleanDay/", @cleanday_key)
            LET parId = CONCAT("Participation/", @par_key)
            
            LET comm = FIRST(
              INSERT @comm_data INTO Comment
              RETURN NEW
            )
            
            INSERT {
              _from: parId,
              _to: comm._id
            } INTO authored
            
            INSERT {
              _from: cdId,
              _to: comm._id
            } INTO has_comment
            
            RETURN comm
            """,
            bind_vars={"par_key": participation.key, "comm_data": comm_data,
                       'cleanday_key': cleanday_key}
        )

        par_dict = cursor.next()
        par_dict['key'] = par_dict['_key']

        return Comment.model_validate(par_dict)


if __name__ == "__main__":
    repo = ParticipationRepo(database)
    # repo.create_comment('51554', '131375', CreateComment(date=datetime.now(), text="Приглашаю всех на субботник!"))
    # print(repo.set_requirements('51554', '131375', ['131380', '131379']))
    # print(repo.get('51554', '1778'))
    # print(repo.create('51554', '1778', ParticipationType.MAYBE_WILL_GO))
    # print(repo.update('51554', '1778', UpdateParticipation(type=ParticipationType.WILL_BE_LATE)))
