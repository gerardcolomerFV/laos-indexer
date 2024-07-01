import { RawMintedWithExternalURI, LaosAsset, Metadata, TokenUri} from "../../model";
import { generateLaosUUID } from "../util";

export function mapMintedWithExternalURItoMetadata(raw: RawMintedWithExternalURI): Metadata {
  const metadata = new Metadata({
    id: generateLaosUUID(raw._tokenId, raw.contract),
    tokenUri: new TokenUri({id: raw._tokenURI}),
    blockNumber: raw.blockNumber,
    timestamp: raw.timestamp,
    txHash: raw.txHash,
  });
  return metadata;
}

export function createMetadataModels(rawMintedWithExternalURI: RawMintedWithExternalURI[]):Metadata[] {
  return rawMintedWithExternalURI.map((raw) => mapMintedWithExternalURItoMetadata(raw));
}