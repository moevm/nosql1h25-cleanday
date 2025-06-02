from arango import ArangoClient
from config.environment import ARANGO_ROOT_PASSWORD

client = ArangoClient(hosts="http://arangodb:8529")

sys = client.db(
    "_system",
    username="root",
    password=ARANGO_ROOT_PASSWORD
)

if not sys.has_database('cleanday'):
    sys.create_database('cleanday')

database = client.db(
    "cleanday",
    username="root",
    password=ARANGO_ROOT_PASSWORD
)

