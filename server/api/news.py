import os
import requests
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List
from db.config import get_database
from db.models.news import NewsArticle, NewsSubmission, NewsArticleResponse
from helpers.crawler import crawl_news
import logging
from math import ceil
from datetime import datetime
from bson import ObjectId

logger = logging.getLogger(__name__)

router = APIRouter()

METAGRAPH_API_URL = os.getenv("METAGRAPH_API_URL", "http://localhost:9400")

@router.post("/submit")
async def submit_news(submission: NewsSubmission, database = Depends(get_database)):
    existing_article = await database.news_articles.find_one({"url": str(submission.url)})
    if existing_article:
        logger.info(f"Article with URL {submission.url} already exists in the database")
        return {"message": "Article already exists", "id": str(existing_article["_id"])}

    news_data = await crawl_news(str(submission.url), submission.dag_address)
    if news_data is None:
        raise HTTPException(status_code=400, detail="News is not crawlable")
    
    try:
        result = await database.news_articles.insert_one(news_data.dict(by_alias=True))
        logger.info(f"Successfully stored news article with ID: {result.inserted_id}")
    except Exception as e:
        logger.error(f"Failed to store news article: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to store news article")
    
    return {"message": "News article successfully crawled and stored", "id": str(result.inserted_id)}

@router.get("/", response_model=dict)
async def list_news(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    database = Depends(get_database)
):
    try:
        total_count = await database.news_articles.count_documents({})
        cursor = database.news_articles.find().skip(skip).limit(limit)
        articles = await cursor.to_list(length=limit)
        
        return {
            "items": [NewsArticleResponse(**article) for article in articles],
            "total": total_count,
            "page": ceil(skip / limit) + 1,
            "pages": ceil(total_count / limit)
        }
    except Exception as e:
        logger.error(f"Failed to retrieve news articles: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve news articles")

@router.get("/{article_id}", response_model=NewsArticleResponse)
async def get_news_article(article_id: str, database = Depends(get_database)):
    try:
        article = await database.news_articles.find_one({"_id": ObjectId(article_id)})
        if article is None:
            raise HTTPException(status_code=404, detail="Article not found")
        return NewsArticleResponse(**article)
    except Exception as e:
        logger.error(f"Failed to retrieve news article: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve news article")

@router.get("/constellation/{dag_address}", response_model=List[NewsArticleResponse])
async def get_news_by_constellation(
    dag_address: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    database = Depends(get_database)
):
    try:
        cursor = database.news_articles.find({"dag_address": dag_address}).skip(skip).limit(limit)
        articles = await cursor.to_list(length=limit)
        if not articles:
            raise HTTPException(status_code=404, detail="No articles found for this constellation")
        return [NewsArticleResponse(**article) for article in articles]
    except Exception as e:
        logger.error(f"Failed to retrieve news articles for constellation {dag_address}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve news articles")

@router.post("/{article_id}/mint")
async def mint_nft(article_id: str, dag_address: str, database = Depends(get_database)):
    logger.info(f"Received minting request for article {article_id} from address {dag_address}")
    try:
        article = await database.news_articles.find_one({"_id": ObjectId(article_id)})
        if not article:
            logger.error(f"Article not found: {article_id}")
            raise HTTPException(status_code=404, detail="Article not found")
        
        if article.get("minted_by"):
            logger.error(f"Article already minted: {article_id}")
            raise HTTPException(status_code=400, detail="Article already minted")
        
        # Prepare the data for the metagraph
        mint_data = {
            "address": dag_address,
            "data": {
                "title": article["title"],
                "content": article["content"],
                "authors": article["authors"],
                "published_date": article["published_date"].isoformat(),
                "url": article["url"],
                "source": article["source"]
            }
        }
        
        logger.info(f"Sending minting request to metagraph: {mint_data}")
        
        # Interact with the local metagraph to mint the NFT
        try:
            mint_response = requests.post(f"{METAGRAPH_API_URL}/l1/data", json=mint_data)
            mint_response.raise_for_status()
            mint_result = mint_response.json()
            logger.info(f"Metagraph minting response: {mint_result}")
            
            # Extract the token ID from the response
            nft_token_id = mint_result.get("hash")  # or mint_result.get("id"), depending on the response
            
            if not nft_token_id:
                logger.error("Failed to mint NFT: No token ID in response")
                raise HTTPException(status_code=500, detail="Failed to mint NFT on metagraph")
        except requests.RequestException as e:
            logger.error(f"Failed to interact with metagraph: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to interact with metagraph: {str(e)}")
        
        # Update the article in the database
        update_result = await database.news_articles.update_one(
            {"_id": ObjectId(article_id)},
            {"$set": {
                "minted_by": dag_address,
                "minted_at": datetime.utcnow(),
                "nft_token_id": nft_token_id
            }}
        )
        
        if update_result.modified_count == 0:
            logger.error(f"Failed to update article in database: {article_id}")
            raise HTTPException(status_code=500, detail="Failed to update article")
        
        logger.info(f"NFT minted successfully for article {article_id}")
        return {"message": "NFT minted successfully", "nft_token_id": nft_token_id}
    except Exception as e:
        logger.error(f"Error minting NFT: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error minting NFT: {str(e)}")

@router.get("/all", response_model=List[NewsArticleResponse])
async def get_all_news(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    database = Depends(get_database)
):
    try:
        cursor = database.news_articles.find().skip(skip).limit(limit)
        articles = await cursor.to_list(length=limit)
        if not articles:
            raise HTTPException(status_code=404, detail="No articles found")
        return [NewsArticleResponse(**article) for article in articles]
    except Exception as e:
        logger.error(f"Failed to retrieve all news articles: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve news articles")