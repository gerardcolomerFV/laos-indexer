import { IpfsService } from './IpfsService';
import { TokenUri, Attribute } from '../../model';

jest.mock('../../model', () => ({
  TokenUri: jest.fn().mockImplementation((data) => data),
  Attribute: jest.fn().mockImplementation((trait_type, value) => ({ trait_type, value })),
}));

describe('IpfsService', () => {
  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('ipfsUrlToHttpUrl', () => {
    it('should return empty string if url is falsy', () => {
      const service = new IpfsService();
      const result = service['ipfsUrlToHttpUrl']('');
      expect(result).toBe('');
    });

    it('should replace ipfs:// with PRIVATE_IPFS_GATEWAY if set', () => {
      const service = new IpfsService();
      process.env.PRIVATE_IPFS_GATEWAY = 'https://private.gateway/';
      const result = service['ipfsUrlToHttpUrl']('ipfs://test-url');
      expect(result).toBe('https://private.gateway/test-url');
    });

    it('should return url as is if it does not start with ipfs://', () => {
      const service = new IpfsService();
      const result = service['ipfsUrlToHttpUrl']('https://test-url');
      expect(result).toBe('https://test-url');
    });
  });

  describe('fetchData', () => {
    it('should return json data if fetch is successful', async () => {
      const service = new IpfsService();
      const mockJson = jest.fn().mockResolvedValue({ data: 'test' });
      mockFetch.mockResolvedValue({ ok: true, json: mockJson });

      const result = await service['fetchData']('https://test-url');
      expect(result).toEqual({ data: 'test' });
      expect(mockFetch).toHaveBeenCalledWith('https://test-url');
    });

    it('should return null if fetch fails', async () => {
      const service = new IpfsService();
      mockFetch.mockRejectedValue(new Error('Fetch error'));

      const result = await service['fetchData']('https://test-url');
      expect(result).toBeNull();
    });

    it('should return null if response is not ok', async () => {
      const service = new IpfsService();
      mockFetch.mockResolvedValue({ ok: false, status: 404 });

      const result = await service['fetchData']('https://test-url');
      expect(result).toBeNull();
    });
  });

  describe('getDataFromIpfs', () => {
    it('should fetch data from IPFS URL', async () => {
      const service = new IpfsService();
      const fetchDataSpy = jest.spyOn(service as any, 'fetchData').mockResolvedValue({ data: 'test' });

      const result = await service['getDataFromIpfs']('ipfs://test-url');
      expect(result).toEqual({ data: 'test' });
      expect(fetchDataSpy).toHaveBeenCalledWith('https://private.gateway/test-url');
    });
  });

  describe('getDataFromHttp', () => {
    it('should fetch data from HTTP URL', async () => {
      const service = new IpfsService();
      const fetchDataSpy = jest.spyOn(service as any, 'fetchData').mockResolvedValue({ data: 'test' });

      const result = await service['getDataFromHttp']('https://test-url');
      expect(result).toEqual({ data: 'test' });
      expect(fetchDataSpy).toHaveBeenCalledWith('https://test-url');
    });
  });

  describe('getTokenURIData', () => {
    it('should fetch and map token URI data correctly', async () => {
      const service = new IpfsService();
      const mockData = {
        name: 'Test Token',
        description: 'Test Description',
        image: 'https://test.image',
        attributes: [{ trait_type: 'type', value: 'value' }],
      };
      jest.spyOn(service as any, 'getDataFromIpfs').mockResolvedValue(mockData);

      const result = await service.getTokenURIData('ipfs://test-url');
      expect(result).toEqual({
        id: 'ipfs://test-url',
        fetchState: 'done',
        name: 'Test Token',
        description: 'Test Description',
        image: 'https://test.image',
        attributes: [{ trait_type: 'type', value: 'value' }],
        fetchedAt: expect.any(Date),
      });
    });

    it('should return empty object if data is null', async () => {
      const service = new IpfsService();
      jest.spyOn(service as any, 'getDataFromIpfs').mockResolvedValue(null);

      const result = await service.getTokenURIData('ipfs://test-url');
      expect(result).toEqual({});
    });


    fit('should fetch and map token URI with wrong type of attributes', async () => {
      const service = new IpfsService();
      const mockData = {
        name: 'Test Token',
        description: 'Test Description',
        image: 'https://test.image',
        attributes: ["kk", "tt"],
      };
      jest.spyOn(service as any, 'getDataFromIpfs').mockResolvedValue(mockData);

      const result = await service.getTokenURIData('ipfs://test-url');
      expect(result).toEqual({
        id: 'ipfs://test-url',
        fetchState: 'done',
        name: 'Test Token',
        description: 'Test Description',
        image: 'https://test.image',
        attributes: [],
        fetchedAt: expect.any(Date),
      });
    });
  });
});
