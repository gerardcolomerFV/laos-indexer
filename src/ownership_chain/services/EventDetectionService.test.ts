
import * as ERC721UniversalContract from '../../abi/UniversalContract';
import { getAccountKey20FromBaseUri } from '../util';
import { EventDetectionService } from './EventDetectionService';
import { RawTransfer, RawOwnershipContract } from '../../model';
import { Context } from '../../__mocks__/Context'
import { mockLogs } from '../../__mocks__/mockdata'



describe('EventDetectionService', () => {
  let ctx: Context;
  let ownershipContractsToCheck: Set<string>;

  beforeEach(() => {
   
    ownershipContractsToCheck = new Set();
  });

  it('should detect new ERC721 universal contracts and transfers', () => {
    ctx = new Context();
    ownershipContractsToCheck.add('0xb176c21d6b66d2fe1b0e7c697610163d28000a65');
    const service = new EventDetectionService(ctx, ownershipContractsToCheck);
    const detectedEvents = service.detectEvents();

    // Validate ownershipContracts
    expect(detectedEvents.ownershipContracts).toHaveLength(1);
    expect(detectedEvents.ownershipContracts[0]).toEqual<RawOwnershipContract>({
      id: '0x52f5de321c9595e7b11f0d91d8c3e816c7d715bb',
      laosContract: '0xFFfFfffFFFffFfFfFffFFFfE000000000000036a',
    });

    // Validate transfers
    expect(detectedEvents.transfers).toHaveLength(1);
    expect(detectedEvents.transfers[0].txHash).toEqual('0x537c05ceff5c3940af2002d2178e5fff09ad0d2f1416ab18d3033dc092775b47');
    expect(detectedEvents.transfers[0].to).toEqual('0x637b4840c99925d9d9698b4a552c447f1cd155dd');
  });

  it('should detect new ERC721 universal contracts and transfers for the same contract', () => {
    ctx = new Context(mockLogs);
    ownershipContractsToCheck.add('0xb176c21d6b66d2fe1b0e7c697610163d28000a65');
    
    const service = new EventDetectionService(ctx, ownershipContractsToCheck);
    const detectedEvents = service.detectEvents();

    // Validate ownershipContracts
    expect(detectedEvents.ownershipContracts).toHaveLength(1);
    expect(detectedEvents.ownershipContracts[0]).toEqual<RawOwnershipContract>({
      id: '0x52f5de321c9595e7b11f0d91d8c3e816c7d715bb',
      laosContract: '0xFFfFfffFFFffFfFfFffFFFfE000000000000036a',
    });

    // Validate transfers
    expect(detectedEvents.transfers).toHaveLength(1);
    expect(detectedEvents.transfers[0].txHash).toEqual('0x537c05ceff5c3940af2002d2178e5fff09ad0d2f1416ab18d3033dc092775b47');
    expect(detectedEvents.transfers[0].to).toEqual('0x637b4840c99925d9d9698b4a552c447f1cd155dd');
  });
});
