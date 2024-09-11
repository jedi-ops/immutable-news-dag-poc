import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.config import get_database, close_mongodb_connection
from api.news import router as news_router
import os

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS configuration
origins = [
    "http://localhost:3000",
    os.getenv("PROD_FRONTEND_URL", "")  # Default to empty string if not set
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Event handlers for startup and shutdown
@app.on_event("startup")
async def startup_db_client():
    await get_database()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongodb_connection()

@app.get("/")
def read_root():
    return {"message": "Howdy from Texas by yeetum and intrana"}

# Include the news router
app.include_router(news_router, prefix="/news", tags=["news"])