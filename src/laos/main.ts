import { TypeormDatabase, TypeormDatabaseOptions, Store } from '@subsquid/typeorm-store'
import { EntityManager } from 'typeorm'
import { processor } from './processor'
import { EventDetectionService } from './service/EventDetectionService';
import { CustomStore } from './service/CustomStore';
import { createMintedWithExternalURIModels } from './mapper/mintMapper';
import { createTokenUriModels } from './mapper/tokenUriMapper';
import { createEvolveModels } from './mapper/evolveMapper';



const options: TypeormDatabaseOptions = {
  supportHotBlocks: true,
  stateSchema: 'laos_processor',
};

class CustomDB<T> extends TypeormDatabase {
  constructor(options: TypeormDatabaseOptions) {
    super(options);
  }
}



processor.run<Store>(new TypeormDatabase(options) as any, async (ctx) => {

  const service = new EventDetectionService(ctx);
  const detectedEvents = service.detectEvents();
  const mintEvents = detectedEvents.mintEvents;
  const evolveEvents = detectedEvents.evolveEvents;

  if (mintEvents.length > 0) {
    const mints = createMintedWithExternalURIModels(mintEvents);
    const tokenUris = createTokenUriModels(mintEvents);
    await ctx.store.upsert(tokenUris);
    await ctx.store.upsert(mints.map(mint => mint.asset));
    await ctx.store.insert(mints.map(mint => mint.metadata));
  }

  if (evolveEvents.length > 0) {
    const evolves = createEvolveModels(evolveEvents);
    const tokenUris = createTokenUriModels(evolveEvents);
    await ctx.store.upsert(tokenUris);
    const customStore = new CustomStore(ctx.store['em']());
    await customStore.evolve(evolves.map(evolve => evolve.asset));
    await ctx.store.insert(evolves.map(evolve => evolve.metadata));
  }

});