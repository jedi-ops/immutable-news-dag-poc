import asyncio
from api import crawl_news

DEFAULT_DAG_ADDRESS = "DAG38E4KCMhidUv8SvovzuJXKsZZ9Ldn58xA6rYz"

async def test_crawl_news():
    # Test URLs
    urls = [
        "https://techcrunch.com/2024/09/04/boeing-and-nasa-prepare-to-bring-starliner-home-without-its-crew-on-friday/"
    ]

    for url in urls:
        print(f"\nTesting URL: {url}")
        result = await crawl_news(url, DEFAULT_DAG_ADDRESS)
        if result:
            print("Crawl successful:")
            for key, value in result.dict().items():
                if key == 'content':
                    print(f"{key}: {value[:100]}...")  # Print only first 100 characters of content
                else:
                    print(f"{key}: {value}")
        else:
            print("Crawl failed")

if __name__ == "__main__":
    asyncio.run(test_crawl_news())