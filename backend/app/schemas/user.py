from pydantic import BaseModel, Field, EmailStr
from typing import Annotated
from ..models.user import PyObjectId

class UserBase(BaseModel):
    email: EmailStr
    username: str  # added username field
    city: str

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: PyObjectId = Field(alias="_id")

class Token(BaseModel):
    access_token: str
    token_type: str
