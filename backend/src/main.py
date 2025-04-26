from fastapi import FastAPI, APIRouter

api_router = APIRouter(prefix="/api")

server = FastAPI()
server.include_router(api_router)
