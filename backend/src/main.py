from fastapi import FastAPI, APIRouter
from api.user import router as user_router
from api.cleanday import router as cleanday_router

api_router = APIRouter(prefix="/api")
api_router.include_router(user_router)
api_router.include_router(cleanday_router)

server = FastAPI()
server.include_router(api_router)
