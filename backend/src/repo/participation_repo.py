from enum import Enum, StrEnum, auto
from typing import Optional, Tuple

from arango.database import StandardDatabase

from data.entity import Participation, ParticipationType
from repo.cleanday_repo import CleandayRepo
from repo.client import database
from repo.model import UpdateParticipation
from repo.user_repo import UserRepo


class CreateResult(StrEnum):
    CREATED = auto()
    USER_DOES_NOT_EXIST = auto()
    CLEANDAY_DOES_NOT_EXIST = auto()
    PARTICIPATION_ALREADY_EXISTS = auto()


class ParticipationRepo:
    def __init__(self, database: StandardDatabase):
        self.db = database
        self.user_repo = UserRepo(database)
        self.cleanday_repo = CleandayRepo(database)
        pass

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
        par = self.get(user_key, cleanday_key)

        if par is None:
            return None

        cursor = self.db.aql.execute(
            """
            LET parId = CONCAT("Participation/", @par_key)
            
            FOR par Participation
                FILTER par._id == parId
                UPDATE par WITH @data IN Participation
                RETURN NEW
            """,
            bind_vars={"par_key": par.key, "data": par.model_dump(exclude_none=True)}
        )

        if cursor.empty():
            return None

        par_dict = cursor.next()
        par_dict['key'] = par_dict['_key']

        return Participation.model_validate(par_dict)


if __name__ == "__main__":
    repo = ParticipationRepo(database)
    print(repo.get('51554', '1778'))
    print(repo.create('51554', '1778', ParticipationType.MAYBE_WILL_GO))
