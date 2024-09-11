# Immutable News API

This API provides functionality to ingest news articles and initiate a crawling workflow.

## General Data Flow Diagram
```mermaid
flowchart TD
    A[Client] -->|Submit News| B[Server]
    B -->|Validate & Store| C[(MongoDB)]
    C -->|Pull Data| D[Metagraph Data L1]
    D -->|Tokenize, Snapshot, & Make Immutable| E[Metagraph L0]
    A -->|Request News| B
    B -->|Retrieve Data| C
    B -->|Serve News| A
```
## News Specific Data Flow Diagram
```mermaid
sequenceDiagram
    participant C as Client
    participant S as Server
    participant NC as News Crawler
    participant M as MongoDB
    participant CMD1 as Metagraph Data L1
    participant CMD0 as Metagraph L0

    C->>S: POST /news/submit
    S->>M: Check for duplicate URL
    M-->>S: URL status
    alt URL is unique
        S->>NC: Crawl news source URL
        alt Crawling successful
            NC-->>S: Crawled content
            S->>M: Store news item with crawled content
            M-->>S: Confirmation
            S->>C: 200 OK
            M->>CMD1: Pull new data
            CMD1->>CMD0: Snapshot & Tokenize
        else Crawling failed
            NC-->>S: Crawling error
            S->>C: Error - Unable to crawl news source
        end
    else URL is duplicate
        S->>C: 400 Bad Request
    end

    C->>S: GET /news?skip=0&limit=10
    S->>M: Retrieve news items
    M-->>S: News items
    S->>C: 200 OK with news items

    C->>S: GET /news/{UUID}
    S->>M: Retrieve specific news item
    M-->>S: News item
    S->>C: 200 OK with news item
```

## Setup Instructions

### Project Setup
*Ensure you have a MongoDB instance running*
1. Clone the repository:
   ```
   git clone https://github.com/your-repo/immutable-news-api.git
   cd immutable-news-api
   cp .env.example .env
   # Modify .env with your MongoDB URI and database name
   ```

2. Create a virtual environment and activate it:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   ```

3. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

4. Run the FastAPI application:
   ```
   fastapi dev api.py
   ```

   The API will be available at `http://localhost:8000`.

## Docker Setup
*The lxml dependency requires system dependencies to be installed. Additional setup may be required on some systems.*
1. Build the Docker image:
   ```
   docker build -t immutable-news-api .
   ```

2. Run the Docker container:
   ```
   docker run -p 8000:8000 immutable-news-api
   ```

Note: The Dockerfile has been updated to install necessary system dependencies for lxml.

## API Documentation

### POST /news/submit

Ingests a news article from a given URL and starts a crawling workflow.

#### Request

- Method: POST
- Content-Type: application/json
```json
{
"url": "https://example.com/news-article"
}
```

#### Response

- Status: 200 OK
- Content-Type: application/json
```json
{
"message": "News article successfully crawled and stored"
}```
## Testing

1. Run the test script:
   ```
   python api/test_crawl_news.py
   ```

2. Use the provided shell script to test the API endpoint:
```sh
   chmod +x api/test-news.sh
   ./api/test-news.sh
```

## Project Structure

- `server.py`: Main FastAPI application entry point
  - `api/`
    
   - `news.py`: News-related API routes
- `helpers/`
  - `crawler.py`: News crawling service
- `db/`
  - `config.py`: Database connection and configuration
    - `models/`
      - `news.py`: Pydantic models for news data
- `tests/`
  - `test_news_api.py`: API tests for news endpoints
  - `test_news_crawler.py`: Unit tests for news crawler
- `requirements.txt`: List of Python dependencies
- `Dockerfile`: Docker configuration for the application
- `README.md`: Project documentation (this file)
- `.env.example`: Example environment variables file
- `.gitignore`: Git ignore file

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.