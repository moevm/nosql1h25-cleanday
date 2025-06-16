from datetime import datetime

from arango.database import StandardDatabase

from data.entity import Log
from repo.client import database
from repo.model import CreateLog, LogRelations

edge_collections = {
    'cleanday_key': 'relates_to_cleanday',
    'user_key': 'relates_to_user',
    'comment_key': 'relates_to_comment',
    'location_key': 'relates_to_location',
    'city_key': 'relates_to_city'
}

collection_names = {
    'cleanday_key': 'CleanDay',
    'user_key': 'User',
    'comment_key': 'Comment',
    'location_key': 'Location',
    'city_key': 'City'
}


class LogRepo:

    def __init__(self, database: StandardDatabase):
        self.db = database

    def create(self, log: CreateLog) -> Log:
        log_data = log.model_dump()
        log_data.pop('keys')
        log_data['date'] = log_data['date'].isoformat()
        bind_vars = {"data": log_data}

        relation_keys = log.keys.model_dump(exclude_none=True)
        aql_insert = []

        for key in relation_keys.keys():
            aql_insert.append(
                f"""
                INSERT {{
                    _from: log._id,
                    _to: CONCAT("{collection_names[key]}/", @{key}),
                }} INTO {edge_collections[key]}
                """
            )
            bind_vars[key] = relation_keys[key]

        query = f"""
            LET log = FIRST(
                INSERT @data INTO Log
                RETURN NEW
            )
            
        {"\n".join(aql_insert)}
            
            RETURN MERGE(log, {{key: log._key}})
            """

        print(query)
        cursor = self.db.aql.execute(
            query, bind_vars=bind_vars
        )

        return Log.model_validate(cursor.next())


if __name__ == '__main__':
    repo = LogRepo(database)
    repo.create(
        CreateLog(date=datetime.now(), type='Test', description='TestLog', keys=LogRelations(
            user_key='1088'
        ))
    )
