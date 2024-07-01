import { TypeormDatabase, TypeormDatabaseOptions, Store } from '@subsquid/typeorm-store'
import { processor, Context } from './processor'
import { EventDetectionService } from './service/EventDetectionService';
import * as EvolutionCollection from '../abi/EvolutionCollection'
import { createMintedWithExternalURIModels } from './mapper/mintMapper';
import { createMetadataModels } from './mapper/metadataMapper';
import { createTokenUriModels } from './mapper/tokenUriMapper';

const options: TypeormDatabaseOptions = {
  supportHotBlocks: true,
  stateSchema: 'laos_processor',
};

processor.run<Store>(new TypeormDatabase(options), async (ctx) => {

  const service = new EventDetectionService(ctx);
  const detectedEvents = service.detectEvents();
  const mintEvents = detectedEvents.mintEvents;
  if (mintEvents.length > 0) {
    await ctx.store.upsert(createMintedWithExternalURIModels(mintEvents));
    await ctx.store.upsert(createTokenUriModels(mintEvents));
    await ctx.store.insert(createMetadataModels(mintEvents));
  }
});