import { EntityManager } from 'typeorm';
import { GetToken, LaosAssetQueryResult } from './GetToken';


export const mockEntityManager = () => {
  return {
    getRepository: jest.fn().mockReturnThis(),
    count: jest.fn(),
    query: jest.fn(),
  } as unknown as EntityManager;
}

describe('GetNftById Resolver', () => {
  let resolver: GetToken;
  let mockTx: jest.Mock;

  beforeEach(() => {
    const manager = mockEntityManager();
    mockTx = jest.fn().mockResolvedValue(manager);
    resolver = new GetToken(mockTx);
  });

  it('should return the total number of Laos assets', async () => {
    const manager = await mockTx();
    manager.count.mockResolvedValue(5);

    const result = await resolver.totalLaosAssets();

    expect(result).toBe(5);
    expect(manager.count).toHaveBeenCalledWith();
  });

  it('should return NFT details by ID', async () => {
    const manager = await mockTx();
    const mockData = [
      {
        id: '1',
        laosContract: 'contract',
        tokenId: 'token1',
        owner: 'owner1',
        tokenUri: 'uri1',
      },
    ];

    manager.query.mockResolvedValue(mockData);

    const result = await resolver.getToken('contractId', 'token1');

    expect(result).toEqual(
      new LaosAssetQueryResult({
        laosContract: 'contract',
        tokenId: 'token1',
        owner: 'owner1',
        tokenUri: 'uri1',
      })
    );
    expect(manager.query).toHaveBeenCalledWith(
      expect.any(String),
      ['contractid', 'token1']
    );
  });

  it('should return null if no NFT details are found', async () => {
    const manager = await mockTx();
    manager.query.mockResolvedValue([]);

    const result = await resolver.getToken('contractId', 'token1');

    expect(result).toBeNull();
    expect(manager.query).toHaveBeenCalledWith(
      expect.any(String),
      ['contractid', 'token1']
    );
  });
});
