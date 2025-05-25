from fastapi import APIRouter

from auth.model import RegisterUser, LoginUser, AuthToken

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
async def register(register_user: RegisterUser) -> AuthToken:
    return AuthToken(access_token="")


@router.post("/login")
async def login(login_user: LoginUser) -> AuthToken:
    return AuthToken(access_token="")

