from fastapi import FastAPI, APIRouter
from api.user import router as user_router

api_router = APIRouter(prefix="/api")
api_router.include_router(user_router)

server = FastAPI()
server.include_router(api_router)
