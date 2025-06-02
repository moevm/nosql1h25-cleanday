import logging
from datetime import datetime, timedelta, UTC

from auth.model import RegisterUser
from data.entity import Sex, CleanDayTag
from data.query import GetUsersParams, CreateCleanday, CreateLocation
from repo.city_repo import CityRepo
from repo.client import database
from api import auth, user, cleanday, location
from repo.user_repo import UserRepo

document_collections = ['City', 'CleanDay', 'Comment', 'Image', 'Location', 'Log', 'Participation',
                        'Requirement', 'User']

edge_collections = ['authored', 'cleanday_image', 'fullfills', 'has_comment', 'has_participation',
                    'has_requirement', 'in_city', 'in_location', 'lives_in', 'location_image',
                    'participation_in', 'relates_to_city', 'relates_to_cleanday', 'relates_to_location',
                    'relates_to_user', 'user_avatar']

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def apply():
    logger.info(' Applying migrations...')
    if database.has_collection(document_collections[0]):
        logger.info(' Collections exist, aborting migration')
        return

    for collection in document_collections:
        database.create_collection(collection)

    for collection in edge_collections:
        database.create_collection(collection, edge=True)

    user_col = database.collection('User')

    computed_values = [
        {
            "name": "level",
            "expression": "RETURN (FLOOR(@doc.score / 50) + 1)",
            "computeOn": ["insert", "update", "replace"],
            "overwrite": False,
            "failOnWarning": False,
            "keepNull": True
        }
    ]

    user_col.configure(computed_values=computed_values)

    trans = database.begin_transaction(
        read=document_collections+edge_collections,
        write=document_collections+edge_collections,
    )
    city_repo = CityRepo(trans)

    spb = city_repo.create('Санкт-Петербург')
    msk = city_repo.create('Москва')

    trans.commit_transaction()

    user_repo = UserRepo(database)

    await auth.register(RegisterUser(
        first_name='Борис',
        last_name='Сухачёв',
        login='boriss',
        sex=Sex.MALE,
        password='12345678',
        city_id=spb.key
    ))

    await auth.register(RegisterUser(
        first_name='Пользователь',
        last_name='Тестовый',
        login='test',
        sex=Sex.MALE,
        password='1234',
        city_id=spb.key
    ))

    await auth.register(RegisterUser(
        first_name='Вероника',
        last_name='Скворцова',
        login='vera',
        sex=Sex.FEMALE,
        password='4321',
        city_id=msk.key
    ))

    loc = await location.create_location(CreateLocation(
        address="Парк Победы",
        instructions="Парк находится к востоку от вестибюля м. Парк Победы",
        city_key=spb.key
    ))

    boris = user_repo.get_raw_by_login('boriss')
    test = user_repo.get_raw_by_login('test')
    vera = user_repo.get_raw_by_login('vera')

    await cleanday.create_cleanday(
        CreateCleanday(
            name='Очистка прудов в Парке Победы',
            location_id=loc.key,
            begin_date=datetime.now(UTC) + timedelta(days=7),
            end_date=datetime.now(UTC) + timedelta(days=7, hours=4),
            organization='Союз субботников',
            area=1000,
            description="Гражданин! Присоединяйся к нашему субботнику по очистке водоёмов Парка Победы!",
            recommended_count=35,
            tags=[CleanDayTag.WATERBODY_CLEANING, CleanDayTag.PICNIC, CleanDayTag.TRASH_COLLECTING],
            requirements=['Придти со своими инструментами', 'Участие во взносе за мусоровоз']
        ),
        boris
    )

