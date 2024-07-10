export type RawEvent = RawMintedWithExternalURI | RawEvolvedWithExternalURI

export interface RawMintedWithExternalURI {
  id: string
  contract: string
  _tokenId: bigint
  _slot: bigint
  _tokenURI: string
  _to: string
  timestamp: Date
  blockNumber: number
  txHash: string
  logIndex: number
}

export interface RawEvolvedWithExternalURI {
  id: string
  contract: string
  _tokenId: bigint
  _tokenURI: string
  timestamp: Date
  blockNumber: number
  txHash: string
  logIndex: number
}

export interface DetectedLaosEvents{
  mintEvents: RawMintedWithExternalURI[],
  evolveEvents: RawEvolvedWithExternalURI[]
}
export interface MetadataAttribute {
  trait_type: string
  value: string
}

export interface RawMetadata {
  image: string
  attributes: MetadataAttribute[]
  name: string
  description: string
}
