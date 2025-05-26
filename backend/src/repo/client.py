from arango import ArangoClient

client = ArangoClient(hosts="http://localhost:8529")

# Connect to the system database
database = client.db(
    "cleanday",
    username="root",
    password="yourpassword"
)

