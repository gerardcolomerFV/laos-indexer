
import { EventDetectionService } from './EventDetectionService';
import { RawOwnershipContract } from '../../model';
import { Context } from '../../__mocks__/Context'
import { mockLogs } from '../../__mocks__/mockdata'

describe('EventDetectionService', () => {
  let ctx: Context;
  let ownershipContractsToCheck: Set<string>;

  beforeEach(() => {   
    ownershipContractsToCheck = new Set();
    const consoleSpy = jest.spyOn(console, 'log');
    consoleSpy.mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should detect new ERC721 universal contracts and transfers', () => {
    process.env.LAOS_GLOBAL_CONSENSUS= '0:0x4756c4042a431ad2bbe61d8c4b966c1328e7a8daa0110e9bbd3d4013138a0bd4'
    process.env.LAOS_PARACHAIN='2000'
    process.env.LAOS_PALLET_INSTANCE= '51'
    ctx = new Context(mockLogs);
    ownershipContractsToCheck.add('0xb176c21d6b66d2fe1b0e7c697610163d28000a65');
    ownershipContractsToCheck.add('0xD1EA24C0d5a9cFe0fd6AE3a75f8047Ba37ee5dC5');
    ownershipContractsToCheck.add('0x31E1818e4ca0f7DEFe50009a2B99485C4B6B795F');
    
    const service = new EventDetectionService(ctx, ownershipContractsToCheck);
    const detectedEvents = service.detectEvents();

    // Validate ownershipContracts
    expect(detectedEvents.ownershipContracts).toHaveLength(1);
    expect(detectedEvents.ownershipContracts[0]).toEqual<RawOwnershipContract>({
      id: '0x31E1818e4ca0f7DEFe50009a2B99485C4B6B795F'.toLowerCase(),
      laosContract: '0xfffffffffffffffffffffffe0000000000000021'.toLowerCase(),
    });

    // Validate transfers
    expect(detectedEvents.transfers).toHaveLength(1);
    expect(detectedEvents.transfers[0].txHash).toEqual('0x1d7bd207884864f063499aafac0bb83967d6e12c3692f408fa05327d8c74d149');
    expect(detectedEvents.transfers[0].to).toEqual('0x8e4dfc6d56e84913fa6a901a3df21de6e9285de8'.toLowerCase());
  });

  it('should detect new ERC721 universal contracts and transfers for the same contract', () => {
    process.env.LAOS_GLOBAL_CONSENSUS= '0:0x4756c4042a431ad2bbe61d8c4b966c1328e7a8daa0110e9bbd3d4013138a0bd4'
    process.env.LAOS_PARACHAIN='2000'
    process.env.LAOS_PALLET_INSTANCE= '51'
    ctx = new Context(mockLogs);
    ownershipContractsToCheck.add('0xb176c21d6b66d2fe1b0e7c697610163d28000a65');
    
    const service = new EventDetectionService(ctx, ownershipContractsToCheck);
    const detectedEvents = service.detectEvents();

    // Validate ownershipContracts
    expect(detectedEvents.ownershipContracts).toHaveLength(1);
    expect(detectedEvents.ownershipContracts[0]).toEqual<RawOwnershipContract>({
      id: '0x31e1818e4ca0f7defe50009a2b99485c4b6b795f'.toLowerCase(),
      laosContract: '0xfffffffffffffffffffffffe0000000000000021'.toLowerCase(),
    });

    // Validate transfers
    expect(detectedEvents.transfers).toHaveLength(1);
    expect(detectedEvents.transfers[0].txHash).toEqual('0x1d7bd207884864f063499aafac0bb83967d6e12c3692f408fa05327d8c74d149');
    expect(detectedEvents.transfers[0].to).toEqual('0x8e4dfc6d56e84913fa6a901a3df21de6e9285de8'.toLowerCase());
  });
});
