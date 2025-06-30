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

edge_collections2 = ['relates_to_comment']


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def apply():
    logger.info(' Applying migrations...')
    await migration_1()
    await migration_2()


async def migration_2():
    logger.info(' [2] Applying...')
    if database.has_collection(edge_collections2[0]):
        logger.info(' [2] Collections exist, aborting migration')
        return

    for collection in edge_collections2:
        database.create_collection(collection, edge=True)


async def migration_1():
    logger.info(' [1] Applying...')
    if database.has_collection(document_collections[0]):
        logger.info(' [1] Collections exist, aborting migration')
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
    tgr = city_repo.create('Таганрог')
    izh = city_repo.create('Ижевск')
    nzn = city_repo.create('Нижний Новгород')
    mrm = city_repo.create('Мурманск')
    klg = city_repo.create('Калининград')

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

    await auth.register(RegisterUser(
        first_name='Анна',
        last_name='Петрова',
        login='annap',
        sex=Sex.FEMALE,
        password='password1',
        city_id=msk.key
    ))

    await auth.register(RegisterUser(
        first_name='Иван',
        last_name='Сидоров',
        login='ivansid',
        sex=Sex.MALE,
        password='password2',
        city_id=klg.key
    ))

    await auth.register(RegisterUser(
        first_name='Мария',
        last_name='Иванова',
        login='mashaivan',
        sex=Sex.FEMALE,
        password='password3',
        city_id=tgr.key
    ))

    await auth.register(RegisterUser(
        first_name='Дмитрий',
        last_name='Кузнецов',
        login='dmitrik',
        sex=Sex.MALE,
        password='password4',
        city_id=izh.key
    ))

    await auth.register(RegisterUser(
        first_name='Ольга',
        last_name='Лебедева',
        login='olga_leb',
        sex=Sex.FEMALE,
        password='password5',
        city_id=nzn.key
    ))

    await auth.register(RegisterUser(
        first_name='Алексей',
        last_name='Романов',
        login='alek_rom',
        sex=Sex.MALE,
        password='password6',
        city_id=mrm.key
    ))

    await auth.register(RegisterUser(
        first_name='Елена',
        last_name='Морозова',
        login='lenamor',
        sex=Sex.FEMALE,
        password='password7',
        city_id=spb.key
    ))

    await auth.register(RegisterUser(
        first_name='Сергей',
        last_name='Васильев',
        login='sergvas',
        sex=Sex.MALE,
        password='password8',
        city_id=msk.key
    ))

    await auth.register(RegisterUser(
        first_name='Татьяна',
        last_name='Фёдорова',
        login='tanya_fed',
        sex=Sex.FEMALE,
        password='password9',
        city_id=klg.key
    ))

    await auth.register(RegisterUser(
        first_name='Павел',
        last_name='Егоров',
        login='pavel_eg',
        sex=Sex.MALE,
        password='password10',
        city_id=tgr.key
    ))

    await auth.register(RegisterUser(
        first_name='Наталья',
        last_name='Григорьева',
        login='natali_g',
        sex=Sex.FEMALE,
        password='password11',
        city_id=izh.key
    ))

    await auth.register(RegisterUser(
        first_name='Виктор',
        last_name='Зайцев',
        login='viktorz',
        sex=Sex.MALE,
        password='password12',
        city_id=nzn.key
    ))

    await auth.register(RegisterUser(
        first_name='Юлия',
        last_name='Калинина',
        login='yulia_k',
        sex=Sex.FEMALE,
        password='password13',
        city_id=mrm.key
    ))

    await auth.register(RegisterUser(
        first_name='Максим',
        last_name='Орлов',
        login='max_orlov',
        sex=Sex.MALE,
        password='password14',
        city_id=spb.key
    ))

    await auth.register(RegisterUser(
        first_name='Светлана',
        last_name='Титова',
        login='sveta_t',
        sex=Sex.FEMALE,
        password='password15',
        city_id=msk.key
    ))

    await auth.register(RegisterUser(
        first_name='Артём',
        last_name='Смирнов',
        login='art_smir',
        sex=Sex.MALE,
        password='password16',
        city_id=klg.key
    ))

    await auth.register(RegisterUser(
        first_name='Вера',
        last_name='Николаева',
        login='vera_n',
        sex=Sex.FEMALE,
        password='password17',
        city_id=izh.key
    ))

    loc = await location.create_location(CreateLocation(
        address="Парк Победы",
        instructions="Парк находится к востоку от вестибюля м. Парк Победы",
        city_key=spb.key
    ))
    loc1 = await location.create_location(CreateLocation(
        address="Парк Горького",
        instructions="Вход со стороны улицы Крымский Вал, рядом с метро Парк Культуры",
        city_key=msk.key
    ))

    loc2 = await location.create_location(CreateLocation(
        address="Центральный парк",
        instructions="Вход напротив здания администрации города",
        city_key=tgr.key
    ))

    loc3 = await location.create_location(CreateLocation(
        address="Площадь Кирова",
        instructions="Рядом с памятником Кирову, напротив театра оперы и балета",
        city_key=izh.key
    ))

    loc4 = await location.create_location(CreateLocation(
        address="Набережная Федоровского",
        instructions="Спуск к набережной от улицы Варварской, рядом с кафе 'Волга'",
        city_key=nzn.key
    ))

    loc5 = await location.create_location(CreateLocation(
        address="Парк имени Кирова",
        instructions="Вход со стороны улицы Ленина, рядом с остановкой 'Парк'",
        city_key=mrm.key
    ))

    loc6 = await location.create_location(CreateLocation(
        address="Парк Юности",
        instructions="Вход напротив торгового центра 'Балтия', рядом с улицей Победы",
        city_key=klg.key
    ))

    loc7 = await location.create_location(CreateLocation(
        address="Сад имени Александра Невского",
        instructions="Вход со стороны улицы Невского, рядом с памятником Александру Невскому",
        city_key=spb.key
    ))

    loc8 = await location.create_location(CreateLocation(
        address="Площадь Ленина",
        instructions="Центральная площадь города, напротив здания мэрии",
        city_key=msk.key
    ))

    loc9 = await location.create_location(CreateLocation(
        address="Парк Дружбы",
        instructions="Вход со стороны улицы Мира, рядом с детской площадкой",
        city_key=izh.key
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

    # Получаем пользователей по логинам
    users = {
        'boriss': user_repo.get_raw_by_login('boriss'),
        'annap': user_repo.get_raw_by_login('annap'),
        'ivansid': user_repo.get_raw_by_login('ivansid'),
        'mashaivan': user_repo.get_raw_by_login('mashaivan'),
        'alek_rom': user_repo.get_raw_by_login('alek_rom'),
        'dmitrik': user_repo.get_raw_by_login('dmitrik'),
        'olga_leb': user_repo.get_raw_by_login('olga_leb'),
        'sergvas': user_repo.get_raw_by_login('sergvas'),
        'tanya_fed': user_repo.get_raw_by_login('tanya_fed'),
        'pavel_eg': user_repo.get_raw_by_login('pavel_eg'),
        'natali_g': user_repo.get_raw_by_login('natali_g'),
        'viktorz': user_repo.get_raw_by_login('viktorz'),
        'yulia_k': user_repo.get_raw_by_login('yulia_k'),
        'max_orlov': user_repo.get_raw_by_login('max_orlov')
    }

    # Список субботников
    cleandays = [
        {
            "name": "Очистка мусора в Парке Горького",
            "location_id": loc1.key,
            "organization": "Городская экологическая служба",
            "area": 1500,
            "description": "Присоединяйтесь к нам в очистке мусора в Парке Горького. Вместе сделаем город чище!",
            "recommended_count": 40,
            "tags": [CleanDayTag.TRASH_COLLECTING, CleanDayTag.PICNIC],
            "requirements": ["Принести перчатки", "Желательно иметь мешки для мусора"],
            "user": users['boriss']
        },
        {
            "name": "Посадка деревьев в Центральном парке",
            "location_id": loc2.key,
            "organization": "Зеленый город",
            "area": 2000,
            "description": "Помогите нам посадить новые деревья в Центральном парке. Ваш вклад в озеленение города!",
            "recommended_count": 50,
            "tags": [CleanDayTag.PLANTING, CleanDayTag.PLANT_CARE],
            "requirements": ["Принести лопаты", "Одежда по погоде"],
            "user": users['annap']
        },
        {
            "name": "Уборка пляжа на Площади Кирова",
            "location_id": loc3.key,
            "organization": "Чистый берег",
            "area": 1800,
            "description": "Присоединяйтесь к уборке пляжа на Площади Кирова. Сделаем наш берег чистым!",
            "recommended_count": 30,
            "tags": [CleanDayTag.TRASH_COLLECTING, CleanDayTag.LEAF_CLEANING],
            "requirements": ["Принести перчатки", "Желательно иметь мешки для мусора"],
            "user": users['ivansid']
        },
        {
            "name": "Ремонт дорожек на Набережной Федоровского",
            "location_id": loc4.key,
            "organization": "Дорстрой",
            "area": 2500,
            "description": "Помогите нам в ремонте дорожек на Набережной Федоровского. Ваши усилия улучшат инфраструктуру города!",
            "recommended_count": 60,
            "tags": [CleanDayTag.REPAIR],
            "requirements": ["Принести инструменты", "Одежда по погоде"],
            "user": users['mashaivan']
        },
        {
            "name": "Покраска скамеек в Парке имени Кирова",
            "location_id": loc5.key,
            "organization": "Краски города",
            "area": 1200,
            "description": "Присоединяйтесь к покраске скамеек в Парке имени Кирова. Сделаем парк ярче!",
            "recommended_count": 25,
            "tags": [CleanDayTag.PAINTING],
            "requirements": ["Принести кисти", "Одежда по погоде"],
            "user": users['alek_rom']
        },
        {
            "name": "Установка кормушек для птиц на Набережной Балтия",
            "location_id": loc6.key,
            "organization": "Птицы Подмосковья",
            "area": 800,
            "description": "Помогите нам установить кормушки для птиц на Набережной Балтия. Поддержим местную фауну!",
            "recommended_count": 20,
            "tags": [CleanDayTag.FEEDER_INSTALLATION],
            "requirements": ["Принести перчатки", "Желательно иметь инструменты"],
            "user": users['dmitrik']
        },
        {
            "name": "Уборка мусора в Саду имени Александра Невского",
            "location_id": loc7.key,
            "organization": "Зеленая столица",
            "area": 1000,
            "description": "Присоединяйтесь к уборке мусора в Саду имени Александра Невского. Сделаем сад чище!",
            "recommended_count": 35,
            "tags": [CleanDayTag.TRASH_COLLECTING],
            "requirements": ["Принести перчатки", "Желательно иметь мешки для мусора"],
            "user": users['olga_leb']
        },
        {
            "name": "Посадка цветов на Площади Ленина",
            "location_id": loc8.key,
            "organization": "Цветочный город",
            "area": 1500,
            "description": "Помогите нам посадить цветы на Площади Ленина. Сделаем площадь ярче!",
            "recommended_count": 45,
            "tags": [CleanDayTag.PLANTING],
            "requirements": ["Принести лопаты", "Одежда по погоде"],
            "user": users['sergvas']
        },
        {
            "name": "Уборка мусора в Парке Дружбы",
            "location_id": loc9.key,
            "organization": "Чистый город",
            "area": 1300,
            "description": "Присоединяйтесь к уборке мусора в Парке Дружбы. Вместе сделаем парк чище!",
            "recommended_count": 40,
            "tags": [CleanDayTag.TRASH_COLLECTING],
            "requirements": ["Принести перчатки", "Желательно иметь мешки для мусора"],
            "user": users['tanya_fed']
        },
        {
            "name": "Сортировка мусора в Саду имени Александра Невского",
            "location_id": loc7.key,
            "organization": "Эко-столицу",
            "area": 1100,
            "description": "Помогите нам в сортировке мусора в Саду имени Александра Невского. Поддержим экологию!",
            "recommended_count": 30,
            "tags": [CleanDayTag.TRASH_SORTING],
            "requirements": ["Принести перчатки", "Желательно иметь контейнеры для сортировки"],
            "user": users['pavel_eg']
        },
        {
            "name": "Уборка снега на Площади Ленина",
            "location_id": loc8.key,
            "organization": "Зима в городе",
            "area": 2000,
            "description": "Присоединяйтесь к уборке снега на Площади Ленина. Сделаем площадь безопасной!",
            "recommended_count": 50,
            "tags": [CleanDayTag.SNOW_REMOVAL],
            "requirements": ["Принести лопаты", "Одежда по погоде"],
            "user": users['natali_g']
        },
        {
            "name": "Уход за растениями в Парке Дружбы",
            "location_id": loc9.key,
            "organization": "Зеленая столица",
            "area": 1400,
            "description": "Помогите нам в уходе за растениями в Парке Дружбы. Поддержим зеленые насаждения!",
            "recommended_count": 35,
            "tags": [CleanDayTag.PLANT_CARE],
            "requirements": ["Принести перчатки", "Одежда по погоде"],
            "user": users['viktorz']
        }
    ]

    # Создаем субботники
    for i, cleanday_data in enumerate(cleandays, start=1):
        await cleanday.create_cleanday(
            CreateCleanday(
                name=cleanday_data["name"],
                location_id=cleanday_data["location_id"],
                begin_date=datetime.now(UTC) + timedelta(days=7 + i),
                end_date=datetime.now(UTC) + timedelta(days=7 + i, hours=4),
                organization=cleanday_data["organization"],
                area=cleanday_data["area"],
                description=cleanday_data["description"],
                recommended_count=cleanday_data["recommended_count"],
                tags=cleanday_data["tags"],
                requirements=cleanday_data["requirements"]
            ),
            cleanday_data["user"]
        )
