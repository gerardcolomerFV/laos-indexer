import { RawTransfer, Transfer, Asset, OwnershipContract } from '../../model';
import { generateAssetUUID } from '../util';

export function mapToAsset(raw: RawTransfer): Asset {
  const asset = new Asset({
    id: generateAssetUUID(raw.tokenId, raw.ownershipContract),
    ownershipContract: new OwnershipContract({ id: raw.ownershipContract }),
    tokenId: raw.tokenId,
    owner: raw.to,
    transfers: [],
  });
  return asset;
}

export function createAssetModels(rawTransfers: RawTransfer[]): Asset[] {
  return rawTransfers.map(mapToAsset);
}
