# backend/app/database.py

import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

# Load environment variables from the .env file
load_dotenv()

# The MONGO_DETAILS variable is now loaded from the .env file
MONGO_DETAILS = os.environ.get("MONGO_DETAILS")

if not MONGO_DETAILS:
    # This is a fallback or an error message if the variable is not set
    print("WARNING: MONGO_DETAILS environment variable not set. Using default.")
    MONGO_DETAILS = "mongodb://localhost:27017"

# Create a client for MongoDB connection
client = AsyncIOMotorClient(MONGO_DETAILS)

# Access the database and collections
database = client.users

def get_database():
    return database
