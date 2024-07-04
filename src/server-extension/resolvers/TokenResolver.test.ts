import { EntityManager } from 'typeorm';
import { TokenResolver } from './TokenResolver';
import { TokenQueryResult, TokenOrderByOptions } from '../../model';

export const mockEntityManager = () => {
  return {
    getRepository: jest.fn().mockReturnThis(),
    count: jest.fn(),
    query: jest.fn(),
  } as unknown as EntityManager;
}

describe('GetNftById Resolver', () => {
  let resolver: TokenResolver;
  let mockTx: jest.Mock;

  beforeEach(() => {
    const manager = mockEntityManager();
    mockTx = jest.fn().mockResolvedValue(manager);
    resolver = new TokenResolver(mockTx);
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
        tokenId: 'token1',
        owner: 'owner1',
        tokenUri: 'uri1',
        createdAt: new Date('2021-01-01'),
      },
    ];

    manager.query.mockResolvedValue(mockData);

    const result = await resolver.token('contractId', 'token1');

    expect(result).toEqual(
      new TokenQueryResult({
        createdAt: new Date('2021-01-01'),
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

    const result = await resolver.token('contractId', 'token1');

    expect(result).toBeNull();
    expect(manager.query).toHaveBeenCalledWith(
      expect.any(String),
      ['contractid', 'token1']
    );
  });

  describe('GetTokensByCollection Resolver', () => {
    let resolver: TokenResolver;
    let mockTx: jest.Mock;
  
    beforeEach(() => {
      const manager = mockEntityManager();
      mockTx = jest.fn().mockResolvedValue(manager);
      resolver = new TokenResolver(mockTx);
    });
  
    it('should return tokens by collection ID', async () => {
      const manager = await mockTx();
      const mockData = [
        {
          tokenId: 'token1',
          owner: 'owner1',
          tokenUri: 'uri1',
          createdAt: new Date('2021-01-01'),
          contractAddress: 'contract1',
          initialOwner: 'initialOwner1'
        },
      ];
  
      manager.query.mockResolvedValue(mockData);
  
      const result = await resolver.tokensByCollection('collectionId', {
        limit: 10,
        offset: 0,
        orderBy: TokenOrderByOptions.CREATED_AT_ASC,
      });
  
      expect(result).toEqual(
        mockData.map(data => new TokenQueryResult({
          ...data,
          createdAt: new Date(data.createdAt),
        }))
      );
      expect(manager.query).toHaveBeenCalledWith(
        expect.any(String),
        ['collectionId', 10, 0]
      );
    });
  
    it('should return an empty array if no tokens are found', async () => {
      const manager = await mockTx();
      manager.query.mockResolvedValue([]);
  
      const result = await resolver.tokensByCollection('collectionId', {
        limit: 10,
        offset: 0,
        orderBy: TokenOrderByOptions.CREATED_AT_ASC,
      });
  
      expect(result).toEqual([]);
      expect(manager.query).toHaveBeenCalledWith(
        expect.any(String),
        ['collectionId', 10, 0]
      );
    });
  
  });
});
