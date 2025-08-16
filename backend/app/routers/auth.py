# backend/app/routers/auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated

from ..schemas import user as user_schemas
from ..services import auth as auth_service
from ..database import get_database  # <-- Added this import

# Create a FastAPI router
router = APIRouter(
    tags=["Authentication"],
)

@router.post("/register", response_model=user_schemas.UserOut)
async def register(user: user_schemas.UserCreate):
    """
    Registers a new user.
    """
    db = get_database()
    return await auth_service.register_user(db, user)

@router.post("/token", response_model=user_schemas.Token)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    """
    Logs in a user and returns an access token.
    """
    db = get_database()
    user = await auth_service.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth_service.create_access_token(data={"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}
