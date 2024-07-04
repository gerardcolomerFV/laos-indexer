import { TypeormDatabase, TypeormDatabaseOptions, Store } from '@subsquid/typeorm-store'
import { EntityManager } from 'typeorm'
import { processor } from './processor'
import { EventDetectionService } from './service/EventDetectionService';
import { createMintedWithExternalURIModels } from './mapper/mintMapper';
import { createTokenUriModels } from './mapper/tokenUriMapper';
import { createEvolveModels } from './mapper/evolveMapper';
import { LaosAsset } from '../model';

export class CustomStore {
  private entityManager: EntityManager;

  constructor(em: EntityManager) {
    this.entityManager = em;
  }

  async evolve(entities: LaosAsset[]): Promise<void> {
    for (const entity of entities) {
      const { id, ...attributes } = entity;
      await this.entityManager.update(LaosAsset, id, attributes);
    }
  }
}

const options: TypeormDatabaseOptions = {
  supportHotBlocks: true,
  stateSchema: 'laos_processor',
};



processor.run<Store>(new TypeormDatabase(options) as any, async (ctx) => {

  const service = new EventDetectionService(ctx);
  const detectedEvents = await service.detectEvents();
  const mintEvents = detectedEvents.mintEvents;
  const evolveEvents = detectedEvents.evolveEvents;

  if (mintEvents.length > 0) {
    const mints = createMintedWithExternalURIModels(mintEvents);
    const tokenUris = createTokenUriModels(mintEvents);

    // Insert or update token URIs first
    await ctx.store.upsert(tokenUris);

    // Insert or update assets and metadata
    await ctx.store.upsert(mints.map(mint => mint.asset));
    await ctx.store.insert(mints.map(mint => mint.metadata));
  }

  if (evolveEvents.length > 0) {
    const evolves = createEvolveModels(evolveEvents);
    const evolveTokenUris = evolves.map(evolve => evolve.metadata.tokenUri);

    // Insert or update evolve token URIs first
    await ctx.store.upsert(evolveTokenUris);

    // Insert or update assets and metadata
    const customStore = new CustomStore(ctx.store['em']());
    await customStore.evolve(evolves.map(evolve => evolve.asset));
    await ctx.store.insert(evolves.map(evolve => evolve.metadata));
  }

});