from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer

from ..schemas import user as user_schemas
from ..database import get_database

# 🔐 Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 🔑 JWT Configuration
SECRET_KEY = "your-secret-key"  # Replace this with a secure key in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# 🛡️ OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/user/token")


def verify_password(plain_password, hashed_password):
    """
    Verifies a plain-text password against a hashed one.
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    """
    Hashes a plain-text password.
    """
    return pwd_context.hash(password)


async def register_user(db: AsyncIOMotorDatabase, user_in: user_schemas.UserCreate):
    """
    Registers a new user in the database. Checks for unique email/username.
    """
    # Check for existing email OR username
    existing_user = await db.users.find_one({
        "$or": [{"email": user_in.email}, {"username": user_in.username}]
    })
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email or username already registered"
        )

    # Hash password and insert user
    hashed_password = get_password_hash(user_in.password)
    user_data = user_in.model_dump()
    user_data["password"] = hashed_password

    new_user = await db.users.insert_one(user_data)
    created_user = await db.users.find_one({"_id": new_user.inserted_id})

    return user_schemas.UserOut(**created_user)


async def authenticate_user(db: AsyncIOMotorDatabase, identifier: str, password: str):
    """
    Authenticates user using either email or username.
    """
    user = await db.users.find_one({
        "$or": [{"email": identifier}, {"username": identifier}]
    })
    if not user or not verify_password(password, user["password"]):
        return False
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    Creates a JWT access token for the user.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_email = payload.get("sub")
        print(f"🔍 JWT payload: {payload}")  # Debug line
        print(f"🔍 Extracted user_email: {user_email}")  # Debug line
        if user_email is None:
            raise credentials_exception
        return user_email
    except JWTError as e:
        print(f"🔍 JWT Error: {e}")  # Debug line
        raise credentials_exception