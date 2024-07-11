import { RawEvolvedWithExternalURI } from "../../model";
import { createEvolveModels } from "./evolveMapper";

describe('Evolve Mapper', () => {

  beforeEach(() => {
    const consoleSpy = jest.spyOn(console, 'log');
    consoleSpy.mockImplementation(() => {});
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });
  
  it('should map evolve events correctly', () => {    
    const rawEvolveEvents: RawEvolvedWithExternalURI[] = [
      {
        id: '1',
        _tokenId: BigInt(1),
        _tokenURI: 'https://example.com/token1.json',
        blockNumber: 1,
        timestamp: new Date(),
        txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        contract: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        logIndex: 1,
      },
    ];
    const evolveModels = createEvolveModels(rawEvolveEvents);
    expect(evolveModels).toHaveLength(rawEvolveEvents.length);
    evolveModels.forEach((evolve, index) => {
      expect(evolve.metadata.id).toBeDefined();
      expect(evolve.metadata.tokenUri.id).toBeDefined();
      expect(evolve.metadata.blockNumber).toEqual(rawEvolveEvents[index].blockNumber);
      expect(evolve.metadata.timestamp).toEqual(rawEvolveEvents[index].timestamp);
      expect(evolve.metadata.txHash).toEqual(rawEvolveEvents[index].txHash);
      expect(evolve.asset.id).toBeDefined();
      expect(evolve.asset.tokenId).toEqual(rawEvolveEvents[index]._tokenId);
      expect(evolve.asset.laosContract).toEqual(rawEvolveEvents[index].contract);
      expect(evolve.asset.metadata).toEqual(evolve.metadata.id);
    });
  });
});
