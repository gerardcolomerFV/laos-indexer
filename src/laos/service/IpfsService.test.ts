import { IpfsService } from './IpfsService';
import { TokenUriFetchState } from '../../model';



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
    afterEach(() => {
      jest.clearAllMocks();
    });
    // TODO does not work with test only with real data
    xit('should fetch and map token URI data correctly', async () => {
      const service = new IpfsService();
      const mockData = {
        name:"Hello World",
        description:"description",
        image:"https://ipfs.io/ipfs/QmS326uhnQp5PsnznQvHhkzqKLfB7ieWz3onmFXsRvERig",
        attributes:[{"trait_type":"health","value":"10"},{"trait_type":"speed","value":"2"}]
      };
      jest.spyOn(service as any, 'getDataFromIpfs').mockResolvedValue(mockData);

      const result = await service.getTokenURIData('ipfs://test-url');
      expect(result).toEqual({
        id: 'ipfs://test-url',
        state: TokenUriFetchState.Done,
        name: 'Hello World',
        description: 'description',
        image: 'https://ipfs.io/ipfs/QmS326uhnQp5PsnznQvHhkzqKLfB7ieWz3onmFXsRvERig',
        attributes: [{ trait_type: 'health', value: '10' }, { trait_type: 'speed', value: '2' }],
        fetched: expect.any(Date),
      });
    });

    it('should throw an error if data is null', async () => {
      const service = new IpfsService();
      jest.spyOn(service as any, 'getDataFromIpfs').mockResolvedValue(null);

      await expect(service.getTokenURIData('ipfs://test-url')).rejects.toThrow();
    });

    it('should fetch and map token URI with wrong type of attributes', async () => {
      const service = new IpfsService();
      const mockData = {
        name: 'Test Token',
        description: 'Test Description',
        image: 'https://test.image',
        attributes: ["wrong", "xxx"],
      };
      // global spy on console warn
      const consoleWarnSpy = jest.spyOn(console, 'warn');
      consoleWarnSpy.mockImplementation(() => {});

      jest.spyOn(service as any, 'getDataFromIpfs').mockResolvedValue(mockData);

      const result = await service.getTokenURIData('ipfs://test-url');
      expect(result).toEqual({
        id: 'ipfs://test-url',
        state: "fetch_done",
        name: 'Test Token',
        description: 'Test Description',
        image: 'https://test.image',
        attributes: [],
        fetched: expect.any(Date),
      });
    });
  });
});
