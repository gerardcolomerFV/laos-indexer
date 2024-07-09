import { TypeormDatabase, TypeormDatabaseOptions, Store } from '@subsquid/typeorm-store';
import { processor, Context } from './processor';
import { OwnershipContract } from '../model';
import { EventDetectionService } from './service/EventDetectionService';
import { createOwnershipContractsModel } from './mapper/ownershipContractMapper';
import { createTransferModels } from './mapper/transferMapper';
import { createAssetModels } from './mapper/assetMapper';


const options: TypeormDatabaseOptions = {
  supportHotBlocks: true,
  stateSchema: 'ownership_chain_processor',
};

processor.run<Store>(new TypeormDatabase(options), async (ctx) => {
  const ownerShipContracts = await ctx.store.find(OwnershipContract);
  const ownershipContractIds = new Set(ownerShipContracts.map(contract => contract.id));

  const service = new EventDetectionService(ctx, ownershipContractIds);
  const detectedEvents = service.detectEvents();

  const rawOwnershipContracts = detectedEvents.ownershipContracts;
  const rawTransfers = detectedEvents.transfers;

  if (rawOwnershipContracts.length > 0) {
    const ownershipContractsModelArray = createOwnershipContractsModel(detectedEvents.ownershipContracts);
    await ctx.store.insert(ownershipContractsModelArray);
  }

  if (rawTransfers.length > 0) {
    const assetsModels = createAssetModels(rawTransfers);
    for (const assetModel of assetsModels) {
      await ctx.store.upsert(assetModel);
    }
    const transfersModelArray = createTransferModels(rawTransfers);
    await ctx.store.insert(transfersModelArray);
  }
});
