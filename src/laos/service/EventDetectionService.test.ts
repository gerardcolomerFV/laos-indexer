
import { EventDetectionService } from './EventDetectionService';
import { RawTransfer, RawOwnershipContract } from '../../model';
import { Context } from '../../__mocks__/Context'
import { mockLogsMintedEvents } from '../../__mocks__/mockdata'



describe('EventDetectionService', () => {
  let ctx: Context;
  beforeEach(() => {
  });

  it('should detect 2 new MintedWithExternalURI events', () => {
    ctx = new Context(mockLogsMintedEvents);
    const service = new EventDetectionService(ctx);
    const detectedEvents = service.detectEvents();
    console.log(detectedEvents);
    expect(detectedEvents.mintEvents).toHaveLength(2);
    expect(detectedEvents.mintEvents[0]._tokenURI).toEqual('ipfs://QmWwCP24PSGwLRvN2R7S24DHSqVyN8sEZptwN8EugxKxrQ');
    expect(detectedEvents.mintEvents[1]._tokenURI).toEqual('ipfs://QmYXPg1NkPD2rMDi3oHQWsR5kfoZg8FQLNLmW75brHKTqV');


   
  });


});
