import {TypeormDatabase, TypeormDatabaseOptions, Store} from '@subsquid/typeorm-store'

import { DataSource, EntityTarget, FindManyOptions } from 'typeorm';
import {processor, Context} from './processor'
import * as ERC721UniversalContract from '../abi/UniversalContract'
import {getAccountKey20FromBaseUri} from './util'
import {Asset, OwnershipContract, Transfer, RawTransfer, DetectedEvents, RawOwnershipContract } from '../model'
import { v4 as uuidv4 } from 'uuid';
import { generateAssetUUID } from './util';


processor.run<Store>(new TypeormDatabase({supportHotBlocks: true, stateSchema: 'ownership_chain_processor'}), async (ctx) => {
    const ownerShipContracts = await ctx.store.find(OwnershipContract);
    let ownershipContractIds = new Set(ownerShipContracts.map(contract => contract.id));

    let detectedEvents: DetectedEvents = getDetectedEvents(ctx, ownershipContractIds)
    let rawOwnershipContracts: RawOwnershipContract[] = detectedEvents.ownershipContracts
    let rawTransfers: RawTransfer[] = detectedEvents.transfers

    if (rawOwnershipContracts.length > 0) {
        const ownershipContractsModelArray = createOwnershipContractsModel(rawOwnershipContracts)
        await ctx.store.insert(ownershipContractsModelArray)
    }

    if (rawTransfers.length > 0) {
        // Create assets
        const assetsModels = createAssetModels(rawTransfers)
        await ctx.store.upsert([...assetsModels]) 
        
        console.log(`insert ${rawTransfers.length} transfers:`, rawTransfers)
        const transfersModelArray = createTransferModels(rawTransfers)
        await ctx.store.insert(transfersModelArray) 

    }


})


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

function createTransferModels(rawTransfers: RawTransfer[]): Transfer[] {
    let transfersModel: Transfer[] = []
    for (let rt of rawTransfers) {
        transfersModel.push(new Transfer({
            id: rt.id,
            asset: new Asset({ id: generateAssetUUID(rt.tokenId, rt.ownershipContract) }), 
            from: rt.from,
            to: rt.to,
            timestamp: rt.timestamp,
            blockNumber: rt.blockNumber,
            txHash: rt.txHash,
        }))
    }
    return transfersModel  
}



function createAssetModels(rawTransfers: RawTransfer[]): Asset[] {
    let assetsModelMap = rawTransfers.map(rt => {
        const asset = new Asset({
            id: generateAssetUUID(rt.tokenId, rt.ownershipContract),
            ownershipContract: new OwnershipContract({id: rt.ownershipContract}),
            tokenId: rt.tokenId,
            owner: rt.to,
            transfers: [], 
        })
        console.log('asset', asset)
        return asset
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
            ownershipContractsToCheck.add(logDecoded.newContractAddress.toLowerCase()) 
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
