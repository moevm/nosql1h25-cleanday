from typing import Annotated

from fastapi import APIRouter, Query, Depends, HTTPException

from auth.service import get_current_user
from data.entity import Location, City
from data.query import CreateLocation, GetLocationsParams, LocationListResponse, CreateImages, ImageListResponse, \
    GetLocation
from repo.city_repo import CityRepo
from repo.client import database
from repo.location_repo import LocationRepo

router = APIRouter(prefix="/locations", tags=["location"],
                   dependencies=[Depends(get_current_user)])

static_loc_repo = LocationRepo(database)


@router.post("/")
async def create_location(location: CreateLocation) -> GetLocation:
    trans = database.begin_transaction(read=['City', 'Location'], write=['in_city', 'Location'])

    try:
        loc_repo = LocationRepo(trans)
        city_repo = CityRepo(trans)

        if not city_repo.get_by_key(location.city_key):
            raise HTTPException(status_code=404, detail="City not found")

        res = loc_repo.create(location)
        key = res.key

    except Exception as e:
        trans.abort_transaction()
        raise e
    else:
        trans.commit_transaction()

    return static_loc_repo.get_by_key(key)


@router.get("/")
async def get_locations(query: Annotated[GetLocationsParams, Query()]) -> LocationListResponse:
    count, page = static_loc_repo.get_page(query)
    return LocationListResponse(contents=page, total_count=count)


@router.get("/{loc_key}")
async def get_location(loc_key: str) -> GetLocation:
    loc = static_loc_repo.get_by_key(loc_key)
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
    return loc


@router.post("/{loc_key}/images")
async def create_location_images(loc_key: str, images: CreateImages) -> int:
    trans = database.begin_transaction(read=['Image', 'Location'], write=['location_image', 'Location', 'Image'])

    try:
        loc_repo = LocationRepo(trans)
        res = loc_repo.create_images(loc_key, images.images)
        if not res:
            raise HTTPException(status_code=404, detail="Location not found")

    except Exception as e:
        trans.abort_transaction()
        raise e
    else:
        trans.commit_transaction()

    return res


@router.get("/{loc_key}/images")
async def get_location_images(loc_key: str) -> ImageListResponse:
    images = static_loc_repo.get_images(loc_key)
    if images is None:
        raise HTTPException(status_code=404, detail="Location not found")

    return ImageListResponse(contents=images)
