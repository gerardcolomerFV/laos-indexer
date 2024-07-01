import e from "cors";
import { RawMintedWithExternalURI, TokenUri, TokenUirFetchState } from "../../model";
import { generateLaosUUID } from "../util";

export function mapMintedWithExternalURIToTokenUri(raw: RawMintedWithExternalURI): TokenUri {
  const tokenUri = new TokenUri({
    id: raw._tokenURI,
    fetchState: TokenUirFetchState.Pending,
  });
  return tokenUri;
}

export function createTokenUriModels(rawMintedWithExternalURI: RawMintedWithExternalURI[]): TokenUri[] {
  return rawMintedWithExternalURI.map((raw) => mapMintedWithExternalURIToTokenUri(raw));
}
