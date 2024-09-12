package com.my.currency.l0

import cats.effect.Async
import com.my.currency.shared_data.types.Types._
import org.jsoup.Jsoup
import scala.jdk.CollectionConverters._

class ScrapingService[F[_]: Async] {
  def scrapeAndCreateNFTs(): F[List[NFT]] = {
    Async[F].delay {
      val doc = Jsoup.connect("https://example.com").get()
      val articles = doc.select("article").asScala.toList

      articles.zipWithIndex.map { case (article, index) =>
        NFT(
          id = index.toLong,
          collectionId = "scraped_collection",
          owner = Address("0x0000000000000000000000000000000000000000"), // placeholder address
          uri = article.select("a").attr("href"),
          name = article.select("h2").text(),
          description = article.select("p").text(),
          creationDateTimestamp = System.currentTimeMillis(),
          metadata = Map(
            "author" -> article.select(".author").text(),
            "date" -> article.select(".date").text()
          )
        )
      }
    }
  }
}
