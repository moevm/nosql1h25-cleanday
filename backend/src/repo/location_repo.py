from arango.database import StandardDatabase

from data.entity import Location
from data.query import GetLocationsParams, GetLocation, CreateLocation
from repo.client import database


class LocationRepo:

    def __init__(self, database: StandardDatabase):
        self.db = database

    def get_page(self, params: GetLocationsParams) -> (int, list[GetLocation]):
        bind_vars = params.model_dump()

        cursor = self.db.aql.execute(
            """
            LET count = COUNT(
                FOR loc IN Location
                    FILTER CONTAINS(LOWER(loc.address), LOWER(@search_query)) OR @search_query == ""
                    
                    LET city = FIRST(
                        FOR city IN OUTBOUND loc in_city
                            LIMIT 1
                            RETURN MERGE(city, {key: city._key})
                    )
                    FILTER CONTAINS(LOWER(city.name), LOWER(@city_name)) OR @city_name == ""
                    
                    RETURN 1                    
            )
            
            LET page = (
                FOR loc IN Location
                    FILTER CONTAINS(LOWER(loc.address), LOWER(@search_query)) OR @search_query == ""
                    
                    LET city = FIRST(
                        FOR city IN OUTBOUND loc in_city
                            LIMIT 1
                            RETURN MERGE(city, {key: city._key})
                    )
                    FILTER CONTAINS(LOWER(city.name), LOWER(@city_name)) OR @city_name == ""
                    
                    LIMIT @offset, @limit
                    SORT loc.address @sort_order
                    
                    RETURN MERGE(loc, {key: loc._key, city: city})
            )
            
            RETURN {
                count: count,
                page: page
            }
                
            """,
            bind_vars=bind_vars
        )

        result_dict = cursor.next()

        loc_list = list(map(GetLocation.model_validate, result_dict['page']))

        return result_dict['count'], loc_list

    def create(self, location: CreateLocation) -> Location:
        cursor = self.db.aql.execute(
            """
            LET loc = FIRST(
                INSERT @data INTO Location
                RETURN NEW
            )
            
            LET cityId = CONCAT("City/", @city_key)
            
            INSERT {
                "_from": loc._id,
                "_to": cityId
            } INTO in_city
            
            RETURN MERGE(loc, {key: loc._key})
            """,
            bind_vars={"data": {"address": location.address, "instructions": location.instructions},
                       "city_key": location.city_key}

        )

        return Location.model_validate(cursor.next())


if __name__ == '__main__':
    repo = LocationRepo(database)

    print(repo.get_page(GetLocationsParams(sort_order='asc')))
