from pydantic import BaseModel, Field, HttpUrl
from datetime import datetime
from typing import List, Optional
import uuid
import hashlib
import json
from urllib.parse import urlparse

def generate_hash(obj: dict) -> str:
    # Sort the dictionary to ensure consistent ordering
    sorted_dict = json.dumps(obj, sort_keys=True, default=str)
    return hashlib.sha256(sorted_dict.encode()).hexdigest()

def extract_source(url: str) -> str:
    parsed_url = urlparse(url)
    domain = parsed_url.netloc
    parts = domain.split('.')
    if len(parts) > 2:
        return '.'.join(parts[-2:])
    return domain

class NewsSubmission(BaseModel):
    url: HttpUrl
    dag_address: str

class NewsArticle(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
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
    dag_address: str  # Changed from Optional[str] to str
    hash: Optional[str] = None
    minted_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True

    def __init__(self, **data):
        if 'url' in data:
            data['source'] = extract_source(data['url'])
        super().__init__(**data)
        self.hash = generate_hash(self.dict(exclude={'hash', 'minted_at'}))

class NewsArticleResponse(NewsArticle):
    id: str = Field(..., alias="_id")

    class Config:
        allow_population_by_field_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }