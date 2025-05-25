from data.entity import Participation, ParticipationType
from repo.model import UpdateParticipation


class ParticipationRepo:
    def __init__(self):
        pass

    async def get(self, user_key: str, cleanday_key: str) -> Participation:
        pass

    async def create(self, user_key: str, cleanday_key: str, par_type: ParticipationType) -> Participation:
        pass

    async def update(self, user_key: str, cleanday_key: str, par: UpdateParticipation) -> Participation:
        pass
