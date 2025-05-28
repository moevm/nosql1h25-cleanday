from arango.database import StandardDatabase

from data.entity import City
from data.query import GetCityParams
from repo.client import database


class CityRepo:
    def __init__(self, database: StandardDatabase):
        self.db = database

    def create(self, city_name: str) -> City:
        cursor = self.db.aql.execute(
            """
            INSERT {
                name: @city_name
            } INTO City
            RETURN NEW
            """,
            bind_vars={"city_name": city_name}
        )

        city_dict = cursor.next()

        return City.model_validate(city_dict)

    def get_page(self, params: GetCityParams) -> (int, list[City]):
        cursor = self.db.aql.execute(
            """
            LET cities = (
                FOR c IN City
                    FILTER (CONTAINS(LOWER(c.name), LOWER(@search_query)) OR @search_query == "")
                    LIMIT @offset, @limit
                    RETURN MERGE(c, {key: c._key})
            )
            LET city_count = COUNT(
                FOR c IN City
                    FILTER (CONTAINS(LOWER(c.name), LOWER(@search_query)) OR @search_query == "")
                    RETURN c
            )
            
            RETURN {
                "cities": cities,
                "city_count": city_count
            }
            """,
            bind_vars=params.model_dump()
        )

        result_dict = cursor.next()
        city_list = []

        for city in result_dict['cities']:
            city_list.append(city)

        city_list = list(map(lambda c: City.model_validate(c), city_list))

        return result_dict['city_count'], city_list


if __name__ == '__main__':
    repo = CityRepo(database)
    print(repo.get_page(GetCityParams(search_query="санкт")))
