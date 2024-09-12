package com.my.currency.l0

import cats.effect.{IO, Resource}
import com.my.currency.l0.custom_routes.CustomRoutes
import com.my.currency.shared_data.calculated_state.CalculatedStateService
import org.http4s._
import org.tessellation.BuildInfo
import org.tessellation.currency.l0.CurrencyL0App
import org.tessellation.schema.cluster.ClusterId
import org.tessellation.schema.semver.{MetagraphVersion, TessellationVersion}

import java.util.UUID

object Main extends CurrencyL0App(
  "currency-l0",
  "currency L0 node",
  ClusterId(UUID.fromString("517c3a05-9219-471b-a54c-21b7d72f4ae5")),
  MetagraphVersion.unsafeFrom(BuildInfo.version),
  TessellationVersion.unsafeFrom(BuildInfo.version)
) {

  override def dataApplication: Option[Resource[IO, L0NodeContext[IO] => HttpRoutes[IO]]] =
    Some(Resource.pure { context =>
      val calculatedStateService = CalculatedStateService.make[IO]
      val scrapingService = new ScrapingService[IO]
      new CustomRoutes[IO](
        calculatedStateService,
        context.securityProvider,
        context.nodeContext.nodeConfig.http,
        scrapingService
      ).public
    })
}
