from arango import ArangoClient

client = ArangoClient(hosts="http://arangodb:8529")

sys = client.db(
    "_system",
    username="root",
    password="password"
)

if not sys.has_database('cleanday'):
    sys.create_database('cleanday')

database = client.db(
    "cleanday",
    username="root",
    password="password"
)

