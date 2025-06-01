from typing import Annotated

from fastapi import APIRouter, Query

from data.query import GetCitiesParams, CityListResponse

router = APIRouter(prefix="/cities", tags=["cities"])


@router.get("/")
async def get_cities(query: Annotated[GetCitiesParams, Query()]) -> CityListResponse:
    return CityListResponse(contents=[], total_count=0)
    pass
