import {TypeormDatabase} from '@subsquid/typeorm-store'
import {processor, CONTRACT_ADDRESS, Context} from './processor'
import * as ERC721UniversalContract from '../abi/UniversalContract'
import {getAccountKey20FromBaseUri} from './util'
import { OwnershipContract, Transfer } from '../model'
import {RawTransfer, DetectedEvents, RawOwnershipContract} from '../model/ownership/raw'

import {Multicall} from '../abi/multicall'


processor.run(new TypeormDatabase({supportHotBlocks: true, stateSchema: 'ownership_chain_processor'}), async (ctx) => {
    
    const ownerShipContracts = await ctx.store.find(OwnershipContract);
    
    console.log('ownerShipContracts:', ownerShipContracts); 
    let detectedEvents: DetectedEvents = getDetectedEvents(ctx, ownerShipContracts)
    let rawOwnershipContracts: RawOwnershipContract[] = detectedEvents.ownershipContracts
    let rawTransfers: RawTransfer[] = detectedEvents.transfers

    // TODO init tx
    if (rawOwnershipContracts.length > 0) {
        const ownershipContractsModelArray = createOwnershipContractsModel(rawOwnershipContracts)
        await ctx.store.insert(ownershipContractsModelArray)
    }

    // if (rawTransfers.length > 0) {
    //     const transfersModelArray = createTransfersModel(rawTransfers)
    //     await ctx.store.insert(transfersModelArray) 
    // }

    // TODO close tx
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

function createTransfersModel(rawTransfers: RawTransfer[]): Transfer[] {
    let transfersModel: Transfer[] = []
    // for (let rt of rawTransfers) {
    //     transfersModel.push(new Transfer({
    //         id: rt.id,
    //         asset: new Asset({id: rt.id}),
    //         from: rt.from,
    //         to: rt.to,
    //         timestamp: rt.timestamp,
    //         blockNumber: rt.blockNumber,
    //         txHash: rt.txHash,
    //     }))
    // }
    return transfersModel  
}

function getDetectedEvents(ctx: Context, ownershipContracts: OwnershipContract[] ): DetectedEvents {    
    let transfers: RawTransfer[] = []
    let ownershipContractsToInsertInDb: RawOwnershipContract[] = []

    /* get contractListFromDB **/
    let ownershipContractsToCheck: Set<string> = new Set();
    
    for (let block of ctx.blocks) {
        for (let log of block.logs) {

          // New contract deployed?
          if (log.topics[0] === ERC721UniversalContract.events.NewERC721Universal.topic) {
            console.log('********************************************************************')
            const logDecoded = ERC721UniversalContract.events.NewERC721Universal.decode(log)
            console.log(logDecoded)
                       
            ownershipContractsToCheck.add(logDecoded.newContractAddress) // addresses to check transfers
            const laosContractAddress = getAccountKey20FromBaseUri(logDecoded.baseURI)
            ownershipContractsToInsertInDb.push({
                id: logDecoded.newContractAddress,
                laosContract: laosContractAddress,
            })  

            console.log('********************************************************************')
          }

          // Transfer of an asset that belongs to a tracked contract?
          if(ownershipContractsToCheck.has(log.address) && log.topics[0] === ERC721UniversalContract.events.Transfer.topic){
            let {from, to, tokenId} = ERC721UniversalContract.events.Transfer.decode(log)
            transfers.push({
                id: log.id,
                tokenId,
                from,
                to,
                timestamp: new Date(block.header.timestamp),
                blockNumber: block.header.height,
                txHash: log.transactionHash,
            })
          }          
        }
    }

    const detectedEvents: DetectedEvents = {transfers, ownershipContracts: ownershipContractsToInsertInDb}
    return detectedEvents
}
