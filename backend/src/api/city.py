from typing import Annotated

from fastapi import APIRouter, Query, Depends

from auth.service import get_current_user
from data.query import GetCitiesParams, CityListResponse
from repo.city_repo import CityRepo
from repo.client import database

router = APIRouter(prefix="/cities", tags=["cities"])


@router.get("/")
async def get_cities(query: Annotated[GetCitiesParams, Query()]) -> CityListResponse:
    city_repo = CityRepo(database)
    count, page = city_repo.get_page(query)
    return CityListResponse(contents=page, total_count=count)
