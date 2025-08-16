# backend/app/models/user.py

from typing import Optional, Annotated
from pydantic import BaseModel, Field, EmailStr
from pydantic.functional_validators import BeforeValidator

# PyObjectId is a custom type for MongoDB's ObjectId
PyObjectId = Annotated[str, BeforeValidator(str)]

class User(BaseModel):
    """
    User model representing a user in the MongoDB database.
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    email: EmailStr
    password: str
    city: str

    # Pydantic V2 configuration
    model_config = {
        "populate_by_name": True,
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "email": "johndoe@example.com",
                "password": "strongpassword123",
                "city": "Lahore"
            }
        },
    }
