package com.my.currency.shared_data.types

import org.tessellation.schema.address.Address

object Types {
  case class NFT(
    id: Long,
    collectionId: String,
    owner: Address,
    uri: String,
    name: String,
    description: String,
    creationDateTimestamp: Long,
    metadata: Map[String, String]
  )

  case class Collection(
    id: String,
    owner: Address,
    name: String,
    creationDateTimestamp: Long,
    nfts: Map[Long, NFT]
  )

  case class NFTUpdate(
    // Define your update structure here
  )

  case class NFTUpdatesState(
    // Define your state structure here
  )

  case class NFTUpdatesCalculatedState(
    collections: Map[String, Collection]
  )
}
