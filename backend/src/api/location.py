from typing import Annotated

from fastapi import APIRouter, Query

from data.entity import Location, City
from data.query import CreateLocation, GetLocationsParams, LocationListResponse, CreateImages, ImageListResponse, \
    GetLocation

router = APIRouter(prefix="/locations", tags=["location"])


@router.post("/")
async def create_location(location: CreateLocation) -> Location:
    return Location(**location.model_dump(), key="test")


@router.get("/")
async def get_locations(query: Annotated[GetLocationsParams, Query()]) -> LocationListResponse:
    return LocationListResponse(contents=[], total_count=0)


@router.get("/{location_id}")
async def get_location(location_id: int) -> GetLocation:
    return GetLocation(
        key="key",
        address="address",
        instructions="instructions",
        city=City(key="city_key", name="city")
    )


@router.post("/{location_id}/images")
async def create_cleanday_images(location_id: str, images: CreateImages):
    return {"message": "Picture uploaded successfully", "location_id": location_id}


@router.get("/{location_id}/images")
async def get_cleanday_images(location_id: str) -> ImageListResponse:
    return ImageListResponse(images=[])
