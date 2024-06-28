import {TypeormDatabase, TypeormDatabaseOptions, Store} from '@subsquid/typeorm-store'

import { DataSource, EntityTarget, FindManyOptions } from 'typeorm';
import {processor, Context} from './processor'
import * as ERC721UniversalContract from '../abi/UniversalContract'
import {getAccountKey20FromBaseUri} from './util'
import {Asset, OwnershipContract, Transfer, RawTransfer, DetectedEvents, RawOwnershipContract } from '../model'
import { v4 as uuidv4 } from 'uuid';
import { generateUUID } from './util';

interface HashAndHeight {
  height: number
  hash: string
}


interface DatabaseState {
  height: number
  hash: string
  top: HashAndHeight[]
  nonce: number
}

export interface EntityClass<T> {
  new (): T
}


export interface Entity {
  id: string
}

class CustomStore extends Store {
  save<E extends Entity>(entity: E): Promise<void>
    save<E extends Entity>(entities: E[]): Promise<void>
    save<E extends Entity>(e: E | E[]): Promise<void> {
        if (Array.isArray(e)) { // please the compiler
            return this.upsert(e)
        } else {
            return this.upsert(e)
        }
    }
}
class CustomDatabase extends TypeormDatabase {
  private dataSource?: DataSource;

  constructor(options?: TypeormDatabaseOptions) {
      super(options);
  }

  async connect(): Promise<DatabaseState> {
      const state = await super.connect();
      this.dataSource = (this as any).con; // Access the protected member 'con'
      return state;
  }

  getDataSource(): DataSource | undefined {
      return this.dataSource;
  }

  async findWithCustomLogic<T extends Entity>(entityClass: EntityTarget<T>, options?: FindManyOptions<T>): Promise<T[]> {
    if (!this.dataSource) {
        throw new Error('DataSource is not connected');
    }
    // Add your custom implementation here
    return this.dataSource.manager.find(entityClass, options);
}

}


processor.run<CustomStore>(new CustomDatabase({supportHotBlocks: true, stateSchema: 'ownership_chain_processor'}), async (ctx) => {
    const ownerShipContracts = await ctx.store.find(OwnershipContract);
    let ownershipContractIds = new Set(ownerShipContracts.map(contract => contract.id));

    let detectedEvents: DetectedEvents = getDetectedEvents(ctx, ownershipContractIds)
    let rawOwnershipContracts: RawOwnershipContract[] = detectedEvents.ownershipContracts
    let rawTransfers: RawTransfer[] = detectedEvents.transfers


    // TODO init tx
    if (rawOwnershipContracts.length > 0) {
        const ownershipContractsModelArray = createOwnershipContractsModel(rawOwnershipContracts)
        await ctx.store.insert(ownershipContractsModelArray)
    }

    if (rawTransfers.length > 0) {
       

        // Create assets
        const assetsModelMap = createAssetsModelMap(rawTransfers)
        console.log(`insert ${assetsModelMap.size} Assets:`, assetsModelMap)
        await ctx.store.upsert([...assetsModelMap.values()]) 
        
        console.log(`insert ${rawTransfers.length} transfers:`, rawTransfers)
        const transfersModelArray = createTransfersModel(rawTransfers, assetsModelMap)
        await ctx.store.insert(transfersModelArray) 

        // TODO update assetTransfers[]
    }

    // TODO close tx **********************
})

interface AssetLogicalId {
    tokenId: string,
    ownershipContract: string,
}

function generateAssetLogicalIdKey(assetLogicalId: AssetLogicalId): string {
    return `${assetLogicalId.tokenId}:${assetLogicalId.ownershipContract}`;
}


function createOwnershipContractsModel(rawOwnershipContracts: RawOwnershipContract[]): OwnershipContract[] {
    let ownershipContractModel: OwnershipContract[] = []
    for (let roc of rawOwnershipContracts) {
        ownershipContractModel.push(new OwnershipContract({
            id: roc.id,
            laosContract: roc.laosContract,
            assets: [],
        }))
    }
    return ownershipContractModel
}

function createTransfersModel(rawTransfers: RawTransfer[], assetsModalMap: Map<string, Asset>): Transfer[] {
    let transfersModel: Transfer[] = []
    for (let rt of rawTransfers) {
        transfersModel.push(new Transfer({
            id: rt.id,
            asset: assetsModalMap.get(rt.id)!,
            from: rt.from,
            to: rt.to,
            timestamp: rt.timestamp,
            blockNumber: rt.blockNumber,
            txHash: rt.txHash,
        }))
    }
    return transfersModel  
}



function createAssetsModelMap(rawTransfers: RawTransfer[]): Asset[] {
    let assetsModelMap = rawTransfers.map(rt => {
        return new Asset({
            id: generateUUID(rt.tokenId.toString(), rt.ownershipContract),
            ownershipContract: new OwnershipContract({id: rt.ownershipContract}),
            tokenId: rt.tokenId,
            owner: rt.to,
            transfers: [], 
        })
    });
    
    return assetsModelMap
}

function getDetectedEvents(ctx: Context, ownershipContractsToCheck: Set<string> ): DetectedEvents {  
    let transfers: RawTransfer[] = []
    let ownershipContractsToInsertInDb: RawOwnershipContract[] = []
    
    for (let block of ctx.blocks) {
        for (let log of block.logs) {
          // New contract deployed?
          if (log.topics[0] === ERC721UniversalContract.events.NewERC721Universal.topic) {
            const logDecoded = ERC721UniversalContract.events.NewERC721Universal.decode(log)
            ownershipContractsToCheck.add(logDecoded.newContractAddress.toLowerCase()) // addresses to check transfers
            const laosContractAddress = getAccountKey20FromBaseUri(logDecoded.baseURI)
            ownershipContractsToInsertInDb.push({
                id: logDecoded.newContractAddress,
                laosContract: laosContractAddress,
            })  
          }

      
          if(ownershipContractsToCheck.has(log.address.toLowerCase()) && log.topics[0] === ERC721UniversalContract.events.Transfer.topic){
            console.log('********************************************************************')
            const logDecoded = ERC721UniversalContract.events.Transfer.decode(log)
            console.log('Transfer detected:', logDecoded);

            let {from, to, tokenId} = logDecoded
            transfers.push({
                id: uuidv4(),
                tokenId,
                from,
                to,
                timestamp: new Date(block.header.timestamp),
                blockNumber: block.header.height,
                txHash: log.transactionHash,
                ownershipContract: log.address,
            })
          }          
        }
    }

    const detectedEvents: DetectedEvents = {transfers, ownershipContracts: ownershipContractsToInsertInDb}
    return detectedEvents
}
