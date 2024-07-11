import { RawMintedWithExternalURI, LaosAsset, Metadata, MintedModels } from "../../model";
import { generateLaosAssetUUID, generateLaosAssetMetadataUUID } from "../util";
import { mapMintedWithExternalURItoMetadata } from "./metadataMapper";

export function mapMintedWithExternalURI(raw: RawMintedWithExternalURI): MintedModels {
  const metadata = mapMintedWithExternalURItoMetadata(raw);
  const asset = new LaosAsset({
    id: generateLaosAssetUUID(raw._tokenId, raw.contract),
    tokenId: raw._tokenId,
    initialOwner: raw._to,
    laosContract: raw.contract,
    createdAt: raw.timestamp,
    logIndex: raw.logIndex,
    metadata: metadata.id,
  });
  console.log('Mapped minted with external URI:', asset);
  return {metadata, asset};
}

export function createMintedWithExternalURIModels(rawMintedWithExternalURI: RawMintedWithExternalURI[]): MintedModels[] {
  return rawMintedWithExternalURI.map((raw) => mapMintedWithExternalURI(raw));
}