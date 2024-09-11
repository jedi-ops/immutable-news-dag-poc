import logging
import newspaper
from datetime import datetime
from db.models.news import NewsArticle, extract_source

logger = logging.getLogger(__name__)

async def crawl_news(url: str, dag_address: str):
    try:
        logger.info(f"Starting to crawl URL: {url}")
        
        article = newspaper.Article(url=url, language='en')
        article.download()
        article.parse()
        
        logger.info("Successfully downloaded and parsed the article")
        
        # Extract the required information
        title = article.title or "Unknown Title"
        content = article.text or "No content found"
        authors = ", ".join(article.authors) if article.authors else "Unknown"
        published_date = article.publish_date or datetime.now()
        
        logger.info(f"Title: {title}")
        logger.info(f"Authors: {authors}")
        logger.info(f"Published Date: {published_date}")
        logger.info(f"Content length: {len(content)} characters")
        
        # Additional information
        top_image = article.top_image
        videos = article.movies
        keywords = article.keywords
        summary = article.summary
        
        logger.info("Successfully extracted all fields")
        
        return NewsArticle(
            title=title,
            content=content,
            authors=authors,
            published_date=published_date,
            url=url,
            source=extract_source(url),
            top_image=top_image,
            videos=videos,
            keywords=keywords,
            summary=summary,
            dag_address=dag_address,
            minted_at=datetime.utcnow()
        )
    except Exception as e:
        logger.error(f"An error occurred while crawling: {str(e)}")
        return None
