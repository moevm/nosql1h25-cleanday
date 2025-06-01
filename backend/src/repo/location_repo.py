from typing import Optional

from arango.database import StandardDatabase

from data.entity import Location, Image
from data.query import GetLocationsParams, GetLocation, CreateLocation
from repo.client import database
from repo.model import CreateImage


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

    def get_raw_by_key(self, loc_key: str) -> Optional[Location]:
        cursor = self.db.aql.execute(
            """
            RETURN DOCUMENT(CONCAT("Location/", @loc_key))
            """, bind_vars={"loc_key": loc_key}
        )

        loc_dict = cursor.next()
        if loc_dict is None:
            return None

        loc_dict['key'] = loc_dict['_key']

        return Location.model_validate(loc_dict)

    def create_images(self, loc_key: str, image_data: list[CreateImage]) -> Optional[int]:

        if not self.get_raw_by_key(loc_key):
            return None

        image_data = list(map(lambda img: img.model_dump(), image_data))

        cursor = self.db.aql.execute(
            """
            RETURN COUNT(FOR image_entry IN @image_data
                LET locId = CONCAT("Location/", @loc_key)
                LET img = FIRST(
                  INSERT image_entry INTO Image
                  RETURN NEW
                )

                INSERT {
                  _from: locId,
                  _to: img._id
                } INTO location_image

                RETURN 1)
            """,
            bind_vars={"loc_key": loc_key, "image_data": image_data},
        )

        return cursor.next()

    def get_images(self, loc_key: str) -> Optional[list[Image]]:
        if not self.get_raw_by_key(loc_key):
            return None

        cursor = self.db.aql.execute(
            """
            LET locId = CONCAT("Location/", @loc_key)

            FOR img IN OUTBOUND locId location_image
                RETURN MERGE(img, {key: img._key})
            """,
            bind_vars={"loc_key": loc_key}
        )

        img_list = []

        for row in cursor:
            img_list.append(Image.model_validate(row))

        return img_list


if __name__ == '__main__':
    repo = LocationRepo(database)

    print(repo.get_page(GetLocationsParams(sort_order='asc')))
    print(repo.get_raw_by_key('121319'))
    print(repo.get_images('121319'))
    # print(repo.create_images('121319', [CreateImage(photo="data", description="5 корпус")]))
