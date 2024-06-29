import { mapToAsset, createAssetModels } from './assetMapper';
import { RawTransfer, Transfer, Asset, OwnershipContract } from '../../model';
import { generateAssetUUID } from '../util';

jest.mock('../util', () => ({
  generateAssetUUID: jest.fn(),
}));

describe('mapToAsset', () => {
  it('should map RawTransfer to Asset correctly', () => {
    const raw: RawTransfer = {
      id: '1',
      tokenId: BigInt(1),
      from: 'address1',
      to: 'address2',
      timestamp: new Date('2021-05-31T12:45:23Z'),
      blockNumber: 123456,
      txHash: 'txhash1',
      ownershipContract: 'contract1',
    };

    const mockedUUID = 'mockedUUID';
    (generateAssetUUID as jest.Mock).mockReturnValue(mockedUUID);

    const expected = new Asset({
      id: mockedUUID,
      ownershipContract: new OwnershipContract({ id: 'contract1' }),
      tokenId: BigInt(1),
      owner: 'address2',
      transfers: [],
    });

    const result = mapToAsset(raw);

    expect(result).toEqual(expected);
    expect(generateAssetUUID).toHaveBeenCalledWith(raw.tokenId, raw.ownershipContract);
  });
});

describe('createAssetModels', () => {
  it('should map an array of RawTransfer to an array of Asset correctly', () => {
    const rawTransfers: RawTransfer[] = [
      {
        id: '1',
        tokenId: BigInt(1),
        from: 'address1',
        to: 'address2',
        timestamp: new Date('2021-05-31T12:45:23Z'),
        blockNumber: 123456,
        txHash: 'txhash1',
        ownershipContract: 'contract1',
      },
      {
        id: '2',
        tokenId: BigInt(2),
        from: 'address3',
        to: 'address4',
        timestamp: new Date('2021-05-31T12:46:24Z'),
        blockNumber: 123457,
        txHash: 'txhash2',
        ownershipContract: 'contract2',
      },
    ];

    const mockedUUID1 = 'mockedUUID1';
    const mockedUUID2 = 'mockedUUID2';
    (generateAssetUUID as jest.Mock)
      .mockReturnValueOnce(mockedUUID1)
      .mockReturnValueOnce(mockedUUID2);

    const expected: Asset[] = [
      new Asset({
        id: mockedUUID1,
        ownershipContract: new OwnershipContract({ id: 'contract1' }),
        tokenId: BigInt(1),
        owner: 'address2',
        transfers: [],
      }),
      new Asset({
        id: mockedUUID2,
        ownershipContract: new OwnershipContract({ id: 'contract2' }),
        tokenId: BigInt(2),
        owner: 'address4',
        transfers: [],
      }),
    ];

    const result = createAssetModels(rawTransfers);

    expect(result).toEqual(expected);
    expect(generateAssetUUID).toHaveBeenCalledWith(rawTransfers[0].tokenId, rawTransfers[0].ownershipContract);
    expect(generateAssetUUID).toHaveBeenCalledWith(rawTransfers[1].tokenId, rawTransfers[1].ownershipContract);
  });
});
