from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import logging
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")

client = None
db = None

async def connect_to_mongodb():
    global client, db
    try:
        logger.info("Attempting to connect to MongoDB...")
        client = AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        
        # Verify the connection
        await client.server_info()
        
        db = client[DATABASE_NAME]
        logger.info(f"Successfully connected to MongoDB. Database: {DATABASE_NAME}")
        return db
    except ConnectionFailure:
        logger.error("Failed to connect to MongoDB. Check your connection string.")
        raise
    except ServerSelectionTimeoutError:
        logger.error("Server selection timeout. MongoDB server might be down.")
        raise
    except Exception as e:
        logger.error(f"An unexpected error occurred while connecting to MongoDB: {str(e)}")
        raise

async def close_mongodb_connection():
    global client, db
    if client:
        logger.info("Closing MongoDB connection...")
        client.close()
        client = None
        db = None
        logger.info("MongoDB connection closed.")

async def get_database():
    global db
    if db is None:
        db = await connect_to_mongodb()
    return db

# Don't initialize the connection here
# connect_to_mongodb()
