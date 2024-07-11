import { Context } from '../processor';
import * as EvolutionCollection from '../../abi/EvolutionCollection'
import {  DetectedLaosEvents,  RawMintedWithExternalURI, RawEvolvedWithExternalURI } from '../../model';

export class EventDetectionService {
  private ctx: Context;

  constructor(ctx: Context) {
    this.ctx = ctx;
  }

  public detectEvents(): DetectedLaosEvents {
    const mintEvents: RawMintedWithExternalURI[] = [];
    let evolveEvents: RawEvolvedWithExternalURI[] = [];

    for (const block of this.ctx.blocks) {
      for (const log of block.logs) {
        this.detectMintedWithExternalURI(log, mintEvents, block.header.timestamp, block.header.height);
        this.detectEvolvedWithExternalURI(log, evolveEvents, block.header.timestamp, block.header.height);
      }
    }
    return {
      mintEvents,
      evolveEvents
    };
  }

  private detectMintedWithExternalURI(log: any, mintedEvents: RawMintedWithExternalURI[], timestamp: number, blockNumber: number): void {
    if (log.topics[0] === EvolutionCollection.events.MintedWithExternalURI.topic) {
      const logDecoded = EvolutionCollection.events.MintedWithExternalURI.decode(log);
      console.log('MintedWithExternalURI detected:', logDecoded);
      const { _to, _slot, _tokenId, _tokenURI } = logDecoded;
      mintedEvents.push({
        id: log.id,
        contract: log.address.toLowerCase(),
        _to: _to.toLowerCase(),
        _slot,
        _tokenId,
        _tokenURI,
        timestamp: new Date(timestamp),
        blockNumber: blockNumber,
        txHash: log.transactionHash,
        logIndex: log.logIndex,
      });
    }
  }

  private detectEvolvedWithExternalURI(log: any, evolvedEvents: RawEvolvedWithExternalURI[], timestamp: number, blockNumber: number): void {
    if (log.topics[0] === EvolutionCollection.events.EvolvedWithExternalURI.topic) {
      const logDecoded = EvolutionCollection.events.EvolvedWithExternalURI.decode(log);
      console.log('EvolvedWithExternalURI detected:', logDecoded);
      const { _tokenId, _tokenURI } = logDecoded;
      evolvedEvents.push({
        id: log.id,
        contract: log.address.toLowerCase(),
        _tokenId,
        _tokenURI,
        timestamp: new Date(timestamp),
        blockNumber: blockNumber,
        txHash: log.transactionHash,
        logIndex: log.logIndex,
      });
    }
  }

}
