import { describe, it, expect } from '@jest/globals';
import { mapEventWithExternalURIToTokenUri, createTokenUriModels } from './tokenUriMapper';
import { RawEvent, TokenUri, TokenUriFetchState } from '../../model';

describe('tokenUriMapper', () => {
  describe('mapEventWithExternalURIToTokenUri', () => {
    it('should map a RawEvent to a TokenUri with Pending state', () => {
      const rawEvent: RawEvent = {
        id: 'test-id',
        contract: 'test-contract',
        _tokenId: BigInt(1),
        _tokenURI: 'test-tokenURI',
        _to: 'test-to',
        timestamp: new Date(),
        blockNumber: 1,
        txHash: 'test-txHash',
        logIndex: 1,
      };
      const expectedTokenUri = new TokenUri({
        id: 'test-tokenURI',
        state: TokenUriFetchState.Pending,
      });
      expect(mapEventWithExternalURIToTokenUri(rawEvent)).toEqual(expectedTokenUri);
    });
  });

  describe('createTokenUriModels', () => {
    it('should create an array of TokenUri models from an array of RawEvents', () => {
      const rawEvents: RawEvent[] = [
        {
          id: 'test-id-1',
          contract: 'test-contract',
          _tokenId: BigInt(1),
          _tokenURI: 'test-tokenURI-1',
          _to: 'test-to-1',
          timestamp: new Date(),
          blockNumber: 1,
          txHash: 'test-txHash-1',
          logIndex: 1,
        },
        {
          id: 'test-id-2',
          contract: 'test-contract',
          _tokenId: BigInt(2),
          _tokenURI: 'test-tokenURI-2',
          _to: 'test-to-2',
          timestamp: new Date(),
          blockNumber: 2,
          txHash: 'test-txHash-2',
          logIndex: 2,
        },
        {
          id: 'test-id-3',
          contract: 'test-contract',
          _tokenId: BigInt(3),
          _tokenURI: 'test-tokenURI-3',
          _to: 'test-to-3',
          timestamp: new Date(),
          blockNumber: 3,
          txHash: 'test-txHash-3',
          logIndex: 3,
        },
      ];
      const expectedTokenUris: TokenUri[] = [
        new TokenUri({
          id: 'test-tokenURI-1',
          state: TokenUriFetchState.Pending,
        }),
        new TokenUri({
          id: 'test-tokenURI-2',
          state: TokenUriFetchState.Pending,
        }),
        new TokenUri({
          id: 'test-tokenURI-3',
          state: TokenUriFetchState.Pending,
        }),
      ];
      expect(createTokenUriModels(rawEvents)).toEqual(expectedTokenUris);
    });

    it('should remove duplicated TokenUri models based on id', () => {
      const rawEvents: RawEvent[] = [
        {
          id: 'test-id-1',
          contract: 'test-contract',
          _tokenId: BigInt(1),
          _tokenURI: 'test-tokenURI-1',
          _to: 'test-to-1',
          timestamp: new Date(),
          blockNumber: 1,
          txHash: 'test-txHash-1',
          logIndex: 1,
        },
        {
          id: 'test-id-2',
          contract: 'test-contract',
          _tokenId: BigInt(2),
          _tokenURI: 'test-tokenURI-2',
          _to: 'test-to-2',
          timestamp: new Date(),
          blockNumber: 2,
          txHash: 'test-txHash-2',
          logIndex: 2,
        },
        {
          id: 'test-id-3',
          contract: 'test-contract',
          _tokenId: BigInt(3),
          _tokenURI: 'test-tokenURI-1', // Duplicate
          _to: 'test-to-3',
          timestamp: new Date(),
          blockNumber: 3,
          txHash: 'test-txHash-3',
          logIndex: 3,
        },
      ];
      const expectedTokenUris: TokenUri[] = [
        new TokenUri({
          id: 'test-tokenURI-1',
          state: TokenUriFetchState.Pending,
        }),
        new TokenUri({
          id: 'test-tokenURI-2',
          state: TokenUriFetchState.Pending,
        }),
      ];
      expect(createTokenUriModels(rawEvents)).toEqual(expectedTokenUris);
    });
  });
});
