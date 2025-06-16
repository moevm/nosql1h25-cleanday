from arango import ArangoClient
from config.environment import ARANGO_ROOT_PASSWORD, DATABASE_NAME

client = ArangoClient(hosts="http://arangodb:8529")

sys = client.db(
    "_system",
    username="root",
    password=ARANGO_ROOT_PASSWORD
)

if not sys.has_database(DATABASE_NAME):
    sys.create_database(DATABASE_NAME)

database = client.db(
    DATABASE_NAME,
    username="root",
    password=ARANGO_ROOT_PASSWORD
)

