from datetime import datetime

from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm

from auth import service as auth_service
from auth.model import RegisterUser, LoginUser, AuthToken
from repo.client import database
from repo.log_repo import LogRepo
from repo.model import CreateUser, CreateLog, LogRelations
from repo.user_repo import UserRepo

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
async def register(register_user: RegisterUser) -> AuthToken:
    trans = database.begin_transaction(read=['City', 'User', 'lives_in', 'Log'],
                                       write=['User', 'lives_in', 'relates_to_user', 'Log'])

    user_repo = UserRepo(trans)
    log_repo = LogRepo(trans)

    if user_repo.get_raw_by_login(register_user.login):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='Login already exists')

    register_dict = register_user.model_dump()
    register_dict['score'] = 0
    register_dict['about_me'] = ""

    register_dict['password'] = auth_service.hash_password(register_dict['password'])

    create_user = CreateUser(
        **register_dict
    )

    user = user_repo.create(create_user)

    if not user_repo.set_city(user.key, register_user.city_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='City not found')

    log_repo.create(
        CreateLog(
            date=datetime.now(),
            type='CreateUser',
            description=f"Создан пользователь с логином '{user.login}'",
            keys=LogRelations(user_key=user.key)
        )
    )

    trans.commit_transaction()

    access_token = auth_service.create_access_token(data={"sub": user.login})
    return AuthToken(access_token=access_token, token_type="bearer")


@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()) -> AuthToken:
    login_user = LoginUser(login=form_data.username, password=form_data.password)

    user_repo = UserRepo(database)
    user = user_repo.get_raw_by_login(login_user.login)

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found')

    if not auth_service.verify_password(login_user.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Incorrect password')

    access_token = auth_service.create_access_token(data={"sub": user.login})
    return AuthToken(access_token=access_token, token_type="bearer")
