from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from bson import ObjectId
from typing import List, Optional

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")

class NewsArticle(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    title: str
    content: str
    authors: str
    published_date: datetime
    url: str
    source: str
    top_image: Optional[str] = None
    videos: List[str] = []
    keywords: List[str] = []
    summary: Optional[str] = None
    dag_address: str
    minted_at: Optional[datetime] = None
    minted_by: Optional[str] = None
    nft_token_id: Optional[str] = None

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class NewsSubmission(BaseModel):
    url: str
    dag_address: str

class NewsArticleResponse(BaseModel):
    id: str = Field(..., alias="_id")
    title: str
    content: str
    authors: str
    published_date: datetime
    url: str
    source: str
    top_image: Optional[str] = None
    videos: List[str] = []
    keywords: List[str] = []
    summary: Optional[str] = None
    dag_address: str
    minted_at: Optional[datetime] = None
    minted_by: Optional[str] = None
    nft_token_id: Optional[str] = None

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

def extract_source(url: str) -> str:
    from urllib.parse import urlparse
    parsed_url = urlparse(url)
    return parsed_url.netloc