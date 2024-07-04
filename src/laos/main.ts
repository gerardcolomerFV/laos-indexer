import { TypeormDatabase, TypeormDatabaseOptions, Store } from '@subsquid/typeorm-store'
import { processor, Context } from './processor'
import { EventDetectionService } from './service/EventDetectionService';
import * as EvolutionCollection from '../abi/EvolutionCollection'
import { createMintedWithExternalURIModels } from './mapper/mintMapper';
import { createTokenUriModels } from './mapper/tokenUriMapper';
import { createEvolveModels } from './mapper/evolveMapper';

const options: TypeormDatabaseOptions = {
  supportHotBlocks: true,
  stateSchema: 'laos_processor',
};

processor.run<Store>(new TypeormDatabase(options), async (ctx) => {

  const service = new EventDetectionService(ctx);
  const detectedEvents = service.detectEvents();
  const mintEvents = detectedEvents.mintEvents;
  const evolveEvents = detectedEvents.evolveEvents;

  if (mintEvents.length > 0) {
    let mints = createMintedWithExternalURIModels(mintEvents);
    let tokenUris = createTokenUriModels(mintEvents);
    
    await ctx.store.upsert(mints.map(mint => mint.asset));
    await ctx.store.upsert(tokenUris);
    await ctx.store.insert(mints.map(mint => mint.metadata));
  }

  if (evolveEvents.length > 0) {
    let evolves = createEvolveModels(evolveEvents);
    let evolveTokenUris = evolves.map(evolve => evolve.metadata.tokenUri);
  
    await ctx.store.upsert(evolves.map(evolve => evolve.asset));
    await ctx.store.upsert(evolveTokenUris);
    await ctx.store.insert(evolves.map(evolve => evolve.metadata));
  }


});