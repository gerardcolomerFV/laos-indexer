import { TypeormDatabase, TypeormDatabaseOptions, Store } from '@subsquid/typeorm-store'
import { EntityManager } from 'typeorm'
import { processor } from './processor'
import { EventDetectionService } from './service/EventDetectionService';
import { TokenURIDataService } from './service/TokenURIDataService';
import { CustomStore } from './service/CustomStore';
import { createMintedWithExternalURIModels } from './mapper/mintMapper';
import { createTokenUriModels } from './mapper/tokenUriMapper';
import { createEvolveModels } from './mapper/evolveMapper';
import { processTokenURIs } from './tokenUriProcessor';

const options: TypeormDatabaseOptions = {
  supportHotBlocks: true,
  stateSchema: 'laos_processor',
};

processor.run<Store>(new TypeormDatabase(options) as any, async (ctx) => {
  const service = new EventDetectionService(ctx);
  const detectedEvents = service.detectEvents();
  const mintEvents = detectedEvents.mintEvents;
  const evolveEvents = detectedEvents.evolveEvents;
  let processTokenUris = false;

  if (mintEvents.length > 0) {
    processTokenUris = true;
    const mints = createMintedWithExternalURIModels(mintEvents);
    const tokenUris = createTokenUriModels(mintEvents);
    await ctx.store.upsert(tokenUris);
    await ctx.store.upsert(mints.map(mint => mint.asset));
    await ctx.store.insert(mints.map(mint => mint.metadata));
  }

  if (evolveEvents.length > 0) {
    processTokenUris = true;
    const evolves = createEvolveModels(evolveEvents);
    const tokenUris = createTokenUriModels(evolveEvents);
    await ctx.store.upsert(tokenUris);
    const customStore = new CustomStore(ctx.store['em']());
    await customStore.evolve(evolves.map(evolve => evolve.asset));
    await ctx.store.insert(evolves.map(evolve => evolve.metadata));
  }
  if (processTokenUris) {
    processTokenURIs();
  }

});