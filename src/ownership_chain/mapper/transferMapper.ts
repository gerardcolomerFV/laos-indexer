import { RawTransfer, Transfer, Asset } from '../../model';
import { generateAssetUUID } from '../util';

export function mapToTransfer(raw: RawTransfer): Transfer {
  return new Transfer({
    id: raw.id,
    asset: new Asset({ id: generateAssetUUID(raw.tokenId, raw.ownershipContract) }),
    from: raw.from,
    to: raw.to,
    timestamp: raw.timestamp,
    blockNumber: raw.blockNumber,
    txHash: raw.txHash,
  });
}

export function createTransferModels(rawTransfers: RawTransfer[]): Transfer[] {
  return rawTransfers.map(mapToTransfer);
}
