from typing import Annotated

from fastapi import APIRouter, Query

from data.entity import Location
from data.query import CreateLocation, GetLocationsParams, LocationListResponse

router = APIRouter(prefix="/locations", tags=["location"])


@router.post("/")
async def create_location(location: CreateLocation) -> Location:
    return Location(**location.model_dump(), key="test")


@router.get("/")
async def get_locations(query: Annotated[GetLocationsParams, Query()]) -> LocationListResponse:
    return LocationListResponse(contents=[], total_count=0)
