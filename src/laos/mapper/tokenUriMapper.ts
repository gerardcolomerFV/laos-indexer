import e from "cors";
import { RawEvent, TokenUri, TokenUirFetchState } from "../../model";
import { generateLaosAssetUUID } from "../util";



export function mapEventWithExternalURIToTokenUri(raw: RawEvent): TokenUri {
  const tokenUri = new TokenUri({
    id: raw._tokenURI,
    fetchState: TokenUirFetchState.Pending,
  });
  return tokenUri;
}

export function createTokenUriModels(rawEvents: RawEvent[]): TokenUri[] {
  const tokenUris = rawEvents.map((raw) => mapEventWithExternalURIToTokenUri(raw));
  // remove duplicated ids
  return tokenUris.filter((tokenUri, index, self) =>
    index === self.findIndex(t => t.id === tokenUri.id)
  );
}
