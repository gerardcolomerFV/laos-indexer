import { RawMintedWithExternalURI, LaosAsset } from "../../model";
import { generateLaosUUID } from "../util";

export function mapMintedWithExternalURI(raw: RawMintedWithExternalURI): LaosAsset {
  const asset = new LaosAsset({
    id: generateLaosUUID(raw._tokenId, raw.contract),
    tokenId: raw._tokenId,
    initialOwner: raw._to,
    laosContract: raw.contract ,
  });
  console.log('Mapped minted with external URI:', asset);
  return asset;
}

export function createMintedWithExternalURIModels(rawMintedWithExternalURI: RawMintedWithExternalURI[]): LaosAsset[] {
  return rawMintedWithExternalURI.map((raw) => mapMintedWithExternalURI(raw));
}