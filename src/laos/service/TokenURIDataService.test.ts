import { EntityManager, Connection } from 'typeorm';
import { TokenUri, TokenUriFetchState } from '../../model';
import { IpfsService } from './IpfsService';
import { TokenURIDataService } from './TokenURIDataService';

jest.mock('typeorm', () => {
  const actualTypeORM = jest.requireActual('typeorm');
  return {
    ...actualTypeORM,
    EntityManager: jest.fn().mockImplementation((connection: Connection) => ({
      find: jest.fn(),
      save: jest.fn(),
    })),
    Connection: jest.fn().mockImplementation(() => ({})),
  };
});

jest.mock('./IpfsService', () => ({
  IpfsService: jest.fn().mockImplementation(() => ({
    getTokenURIData: jest.fn(),
  })),
}));

describe('TokenURIDataService', () => {
  let entityManager: jest.Mocked<EntityManager>;
  let ipfsService: jest.Mocked<IpfsService>;
  let tokenURIDataService: TokenURIDataService;

  beforeEach(() => {
    const connection = new (jest.requireMock('typeorm').Connection)() as jest.Mocked<Connection>;
    entityManager = new EntityManager(connection) as jest.Mocked<EntityManager>;
    ipfsService = new IpfsService() as jest.Mocked<IpfsService>;
    tokenURIDataService = TokenURIDataService.getInstance(entityManager);
    const consoleSpy = jest.spyOn(console, 'log');
    consoleSpy.mockImplementation(() => {});
    const consoleSpyError = jest.spyOn(console, 'error');
    consoleSpyError.mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    // Reset singleton instance for next test
    (TokenURIDataService as any).instance = null;
  });

  it('should create a singleton instance', () => {
    const instance1 = TokenURIDataService.getInstance(entityManager);
    const instance2 = TokenURIDataService.getInstance(entityManager);
    expect(instance1).toBe(instance2);
  });

  it('should not run updatePendingTokenUris if it is already running', async () => {
    entityManager.find.mockResolvedValue([]);
    ipfsService.getTokenURIData.mockResolvedValue({});

    // Simulate the function being in progress
    tokenURIDataService['isUpdating'] = true;
    tokenURIDataService['updateQueue'] = () => Promise.resolve();

    await tokenURIDataService.updatePendingTokenUris();

    expect(entityManager.find).not.toHaveBeenCalled();
  });

 
  it('should process the queued update after the current one finishes', async () => {
    const pendingTokenUris = [{ id: 1, state: TokenUriFetchState.Pending }];
    entityManager.find.mockResolvedValue(pendingTokenUris);
    ipfsService.getTokenURIData.mockResolvedValue({});

    // Simulate the function being in progress
    tokenURIDataService['isUpdating'] = true;

    const updatePromise1 = tokenURIDataService.updatePendingTokenUris();
    const updatePromise2 = tokenURIDataService.updatePendingTokenUris();

    expect(tokenURIDataService['updateQueue']).toBeDefined();

    // Simulate the function finishing
    tokenURIDataService['isUpdating'] = false;
    if (tokenURIDataService['updateQueue']) {
      tokenURIDataService['updateQueue']();
    }

    await updatePromise1;
    await updatePromise2;

    expect(entityManager.find).toHaveBeenCalledTimes(2);
  });

  it('should update pending token URIs', async () => {
    const pendingTokenUris = [
      { id: 1, state: TokenUriFetchState.Pending },
      { id: 2, state: TokenUriFetchState.Pending }
    ];
    entityManager.find.mockResolvedValue(pendingTokenUris);
    ipfsService.getTokenURIData.mockResolvedValue({});

    await tokenURIDataService.updatePendingTokenUris();

    expect(entityManager.find).toHaveBeenCalledWith(TokenUri, { where: { state: TokenUriFetchState.Pending } });
    expect(entityManager.save).toHaveBeenCalledTimes(pendingTokenUris.length);
  });

  it('should handle errors during token URI update', async () => {
    const pendingTokenUris = [
      { id: 1, state: TokenUriFetchState.Pending },
      { id: 2, state: TokenUriFetchState.Pending }
    ];
    entityManager.find.mockResolvedValue(pendingTokenUris);
    ipfsService.getTokenURIData.mockRejectedValue(new Error('IPFS Error'));

    await tokenURIDataService.updatePendingTokenUris();

    expect(entityManager.find).toHaveBeenCalledWith(TokenUri, { where: { state: TokenUriFetchState.Pending } });
    expect(entityManager.save).toHaveBeenCalledTimes(pendingTokenUris.length);
    expect(pendingTokenUris[0].state).toBe(TokenUriFetchState.Fail);
    expect(pendingTokenUris[1].state).toBe(TokenUriFetchState.Fail);
  });
});
