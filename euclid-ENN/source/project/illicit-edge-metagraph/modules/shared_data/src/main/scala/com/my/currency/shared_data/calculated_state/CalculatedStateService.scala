package com.my.currency.shared_data.calculated_state

import cats.effect.Async
import com.my.currency.shared_data.types.Types._
import org.tessellation.schema.SnapshotOrdinal

trait CalculatedStateService[F[_]] {
  def getCalculatedState: F[CalculatedState]
  def setCalculatedState(ordinal: SnapshotOrdinal, state: NFTUpdatesCalculatedState): F[Unit]
}

object CalculatedStateService {
  def make[F[_]: Async]: CalculatedStateService[F] = new CalculatedStateService[F] {
    // Implement the methods here
    def getCalculatedState: F[CalculatedState] = ???
    def setCalculatedState(ordinal: SnapshotOrdinal, state: NFTUpdatesCalculatedState): F[Unit] = ???
  }
}

case class CalculatedState(ordinal: SnapshotOrdinal, state: NFTUpdatesCalculatedState)
