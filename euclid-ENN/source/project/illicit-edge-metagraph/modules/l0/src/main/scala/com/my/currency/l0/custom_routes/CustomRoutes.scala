package com.my.currency.l0.custom_routes

import cats.effect.Async
import com.my.currency.l0.ScrapingService
import com.my.currency.shared_data.calculated_state.CalculatedStateService
import com.my.currency.shared_data.types.Types._
import org.http4s._
import org.http4s.dsl.Http4sDsl
import org.http4s.circe.CirceEntityCodec._
import org.tessellation.security.SecurityProvider
import org.tessellation.node.shared.config.types.HttpConfig

class CustomRoutes[F[_]: Async](
  calculatedStateService: CalculatedStateService[F],
  securityProvider: SecurityProvider[F],
  httpConfig: HttpConfig,
  scrapingService: ScrapingService[F]
) extends Http4sDsl[F] {

  private val routes: HttpRoutes[F] = HttpRoutes.of[F] {
    case GET -> Root / "collections" =>
      for {
        state <- calculatedStateService.getCalculatedState
        collections = state.state.collections.values.toList
        response <- Ok(collections)
      } yield response

    case GET -> Root / "addresses" / address / "nfts" =>
      for {
        state <- calculatedStateService.getCalculatedState
        nfts = state.state.collections.values.flatMap(_.nfts.values).filter(_.owner.address == address).toList
        response <- Ok(nfts)
      } yield response

    case POST -> Root / "scrape-and-create-nfts" =>
      for {
        newNFTs <- scrapingService.scrapeAndCreateNFTs()
        response <- Ok(newNFTs)
      } yield response

    case req @ POST -> Root / "data" =>
      req.decode[NFTUpdate] { update =>
        for {
          // Implement the logic to handle the NFTUpdate
          response <- Ok("Update received")
        } yield response
      }
  }

  val public: HttpRoutes[F] = routes
}
