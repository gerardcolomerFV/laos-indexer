import { RawMintedWithExternalURI, LaosAsset, Metadata, TokenUri, RawEvolvedWithExternalURI, TokenUriFetchState} from "../../model";
import { generateLaosAssetUUID, generateLaosAssetMetadataUUID } from "../util";

export function mapMintedWithExternalURItoMetadata(raw: RawMintedWithExternalURI): Metadata {
  const metadata = new Metadata({
    id: generateLaosAssetMetadataUUID(raw._tokenId, raw.contract),
    tokenUri: new TokenUri({id: raw._tokenURI, state: TokenUriFetchState.Pending}),
    blockNumber: raw.blockNumber,
    timestamp: raw.timestamp,
    txHash: raw.txHash,
    laosAsset: new LaosAsset({
      id: generateLaosAssetUUID(raw._tokenId, raw.contract),
      tokenId: raw._tokenId,
      initialOwner: raw._to,
      logIndex: raw.logIndex,
      laosContract: raw.contract,
    }),

  });
  return metadata;
}

export function mapEvolvedWithExternalURItoMetadata(raw: RawEvolvedWithExternalURI): Metadata {
  const metadata = new Metadata({
    id: generateLaosAssetMetadataUUID(raw._tokenId, raw.contract),
    tokenUri: new TokenUri({id: raw._tokenURI, state: TokenUriFetchState.Pending}),
    blockNumber: raw.blockNumber,
    timestamp: raw.timestamp,
    txHash: raw.txHash,
    laosAsset: new LaosAsset({
      id: generateLaosAssetUUID(raw._tokenId, raw.contract),
      tokenId: raw._tokenId,
      laosContract: raw.contract,
    }),
  });
  return metadata;
}



export function createMetadataModels(rawMintedWithExternalURI: RawMintedWithExternalURI[]):Metadata[] {
  return rawMintedWithExternalURI.map((raw) => mapMintedWithExternalURItoMetadata(raw));
}