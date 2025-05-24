from fastapi import APIRouter

from data.auth import RegisterUser, LoginUser, Token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
async def register(register_user: RegisterUser) -> Token:
    return Token(access_token="")


@router.post("/login")
async def login(login_user: LoginUser) -> Token:
    return Token(access_token="")

