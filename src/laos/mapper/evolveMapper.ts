import { RawEvolvedWithExternalURI, LaosAsset, Metadata, MintedModels } from "../../model";
import { generateLaosAssetUUID, generateLaosAssetMetadataUUID } from "../util";
import { mapEvolvedWithExternalURItoMetadata } from "./metadataMapper";

export function mapEvolveEvent(raw: RawEvolvedWithExternalURI): MintedModels {
  const metadata = mapEvolvedWithExternalURItoMetadata(raw);
  const asset = new LaosAsset({
    id: generateLaosAssetUUID(raw._tokenId, raw.contract),
    tokenId: raw._tokenId,
    laosContract: raw.contract,
    metadata: metadata.id,
  });
  console.log('Mapped evolve event:', asset);
  return { metadata, asset };
}

export function createEvolveModels(rawEvolveEvents: RawEvolvedWithExternalURI[]): MintedModels[] {
  return rawEvolveEvents.map((raw) => mapEvolveEvent(raw));
}
