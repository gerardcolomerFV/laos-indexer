import { EntityManager } from 'typeorm';
import { GetTokensByCollection } from './GetTokensByCollection'; // Adjust the import as needed
import {  LaosAssetQueryResult, OrderByOptions } from '../../model';

export const mockEntityManager = () => {
  return {
    getRepository: jest.fn().mockReturnThis(),
    count: jest.fn(),
    query: jest.fn(),
  } as unknown as EntityManager;
}

describe('GetTokensByCollection Resolver', () => {
  let resolver: GetTokensByCollection;
  let mockTx: jest.Mock;

  beforeEach(() => {
    const manager = mockEntityManager();
    mockTx = jest.fn().mockResolvedValue(manager);
    resolver = new GetTokensByCollection(mockTx);
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

    const result = await resolver.getTokensByCollection('collectionId', 10, 0, OrderByOptions.TOKEN_ID_ASC);

    expect(result).toEqual(
      mockData.map(data => new LaosAssetQueryResult({
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

    const result = await resolver.getTokensByCollection('collectionId', 10, 0, OrderByOptions.TOKEN_ID_ASC);

    expect(result).toEqual([]);
    expect(manager.query).toHaveBeenCalledWith(
      expect.any(String),
      ['collectionId', 10, 0]
    );
  });


});
