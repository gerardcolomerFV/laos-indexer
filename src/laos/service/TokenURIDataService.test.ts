import { EntityManager, Connection } from 'typeorm';
import { Attribute, TokenUri, TokenUriFetchState } from '../../model';
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

  
});
