from fastapi import FastAPI, APIRouter
from api.user import router as user_router
from api.cleanday import router as cleanday_router
from api.auth import router as auth_router
from api.stats import router as stats_router
from api.city import router as city_router
from api.location import router as location_router

api_router = APIRouter(prefix="/api")
api_router.include_router(user_router)
api_router.include_router(cleanday_router)
api_router.include_router(auth_router)
api_router.include_router(stats_router)
api_router.include_router(city_router)
api_router.include_router(location_router)

server = FastAPI()
server.include_router(api_router)
