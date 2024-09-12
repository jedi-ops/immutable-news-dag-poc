import Dependencies.*
import sbt.*

ThisBuild / organization := "com.my.currency"
ThisBuild / scalaVersion := "2.13.10"
ThisBuild / evictionErrorLevel := Level.Warn

ThisBuild / assemblyMergeStrategy := {
  case "logback.xml" => MergeStrategy.first
  case x if x.contains("io.netty.versions.properties") => MergeStrategy.discard
  case PathList(xs@_*) if xs.last == "module-info.class" => MergeStrategy.first
  case x =>
    val oldStrategy = (assembly / assemblyMergeStrategy).value
    oldStrategy(x)
}
lazy val root = (project in file("."))
  .settings(
    name := "illicit-edge-metagraph"
  )
  .aggregate(sharedData, currencyL0, currencyL1, dataL1)

lazy val sharedData = (project in file("modules/shared_data"))
  .settings(
    name := "illicit-edge-shared-data",
    libraryDependencies ++= Seq(
      Libraries.tessellationNodeShared,
      Libraries.tessellationCurrencyL0,
      Libraries.declineCore,
      Libraries.declineEffect,
      Libraries.declineRefined,
      "org.typelevel" %% "cats-effect" % "3.3.14",
      "io.circe" %% "circe-core" % "0.14.3",
      "io.circe" %% "circe-generic" % "0.14.3",
      "io.circe" %% "circe-parser" % "0.14.3",
      CompilerPlugin.betterMonadicFor,
      CompilerPlugin.kindProjector,
      CompilerPlugin.semanticDB
    )
  )

lazy val currencyL0 = (project in file("modules/l0"))
  .settings(
    name := "illicit-edge-currency-l0",
    libraryDependencies ++= Seq(
      Libraries.tessellationNodeShared,
      Libraries.tessellationCurrencyL0,
      Libraries.declineCore,
      Libraries.declineEffect,
      Libraries.declineRefined,
      "org.http4s" %% "http4s-dsl" % "0.23.16",
      "org.http4s" %% "http4s-blaze-server" % "0.23.16",
      "org.http4s" %% "http4s-circe" % "0.23.16",
      "org.jsoup" % "jsoup" % "1.14.3",
      CompilerPlugin.betterMonadicFor,
      CompilerPlugin.kindProjector,
      CompilerPlugin.semanticDB
    )
  )
  .dependsOn(sharedData)

lazy val currencyL1 = (project in file("modules/l1"))
  .settings(
    name := "illicit-edge-currency-l1",
    libraryDependencies ++= Seq(
      Libraries.tessellationNodeShared,
      Libraries.tessellationCurrencyL1,
      Libraries.declineCore,
      Libraries.declineEffect,
      Libraries.declineRefined,
      CompilerPlugin.betterMonadicFor,
      CompilerPlugin.kindProjector,
      CompilerPlugin.semanticDB
    )
  )
  .dependsOn(sharedData)

lazy val dataL1 = (project in file("modules/data_l1"))
  .settings(
    name := "illicit-edge-data-l1",
    libraryDependencies ++= Seq(
      Libraries.tessellationNodeShared,
      Libraries.tessellationCurrencyL1,
      Libraries.declineCore,
      Libraries.declineEffect,
      Libraries.declineRefined,
      CompilerPlugin.betterMonadicFor,
      CompilerPlugin.kindProjector,
      CompilerPlugin.semanticDB
    )
  )
  .dependsOn(sharedData)


resolvers += "Constellation Releases" at "https://github.com/Constellation-Labs/releases/raw/maven/"


resolvers += "Constellation Releases" at "https://github.com/Constellation-Labs/releases/raw/maven/"

githubOwner := "IntranaCorp"
githubRepository := "illicit-edge-metagraph"

