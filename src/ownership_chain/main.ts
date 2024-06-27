import {TypeormDatabase} from '@subsquid/typeorm-store'
import {processor, CONTRACT_ADDRESS, Context} from './processor'
import * as ERC721UniversalContract from '../abi/UniversalContract'
import {getAccountKey20FromBaseUri} from './util'
import { OwnershipContract } from '../model'

import {Multicall} from '../abi/multicall'

processor.run(new TypeormDatabase({supportHotBlocks: true, stateSchema: 'ownership_chain_processor'}), async (ctx) => {
    let detectedEvents: DetectedEvents = getDetectedEvents(ctx)
    let rawTransfers: RawTransfer[] = detectedEvents.transfers
    let rawOwnershipContracts: RawOwnershipContract[] = detectedEvents.ownershipContracts
    console.log('rawTransfers:', rawTransfers)
    console.log('rawOwnershipContracts:', rawOwnershipContracts)

    // TODO init tx
    if (rawOwnershipContracts.length > 0) {
        const ownershipContractsModelArray = createOwnershipContractsModel(rawOwnershipContracts)
        await ctx.store.insert(ownershipContractsModelArray)   
    }

    // TODO close tx
})

interface DetectedEvents{
    transfers: RawTransfer[]
    ownershipContracts: RawOwnershipContract[]
}

interface RawTransfer {
    id: string
    tokenId: bigint
    from: string
    to: string
    timestamp: Date
    blockNumber: number
    txHash: string
}

interface RawOwnershipContract {
    id: string
    laosContract: string | null
}

// function createOwnershipContractsMap(rawOwnershipContracts: RawOwnershipContract[]): Map<string, string | null> {
//     let ownershipContractsMap: Map<string, string | null> = new Map()
//      for (let roc of rawOwnershipContracts) {
//         ownershipContractsMap.set(roc.id, roc.laosContract)
//      }
//      return ownershipContractsMap
//  }

 
 function createOwnershipContractsModel(rawOwnershipContracts: RawOwnershipContract[]): OwnershipContract[] {
    let ownershipContractModel: OwnershipContract[] = []
     for (let roc of rawOwnershipContracts) {
        ownershipContractModel.push({
            id: roc.id,
            laosContract: roc.laosContract,
            //assets: [],
        })
     }
     return ownershipContractModel
 }

function getDetectedEvents(ctx: Context ): DetectedEvents {    
    let transfers: RawTransfer[] = []
    let ownershipContracts: RawOwnershipContract[] = []
    /* get contractListFromDB **/
    
    for (let block of ctx.blocks) {
        for (let log of block.logs) {
          if (log.topics[0] === ERC721UniversalContract.events.NewERC721Universal.topic) {
            console.log('********************************************************************')
            const logDecoded = ERC721UniversalContract.events.NewERC721Universal.decode(log)
            console.log(logDecoded)
           
            // push to list to contractListFromDB
            // get laos contract address and push to be inserted in DB
            const laosContractAddress = getAccountKey20FromBaseUri(logDecoded.baseURI)
            ownershipContracts.push({
                id: logDecoded.newContractAddress,
                laosContract: laosContractAddress,
            })

            // TODO push to db contracts list in memory
            console.log('********************************************************************')
          }
          // TODO add inmemory

          // if log.address is inside of list from db AND!!! new dioscovered contract in this batch
            // if (log.address === CONTRACT_ADDRESS && log.topics[0] === ERC721UniversalContract.events.Transfer.topic) {
            //     let {from, to, tokenId} = ERC721UniversalContract.events.Transfer.decode(log)
            //     transfers.push({
            //         id: log.id,
            //         tokenId,
            //         from,
            //         to,
            //         timestamp: new Date(block.header.timestamp),
            //         blockNumber: block.header.height,
            //         txHash: log.transactionHash,
            //     })
            // }
        }
    }

    const detectedEvents: DetectedEvents = {transfers, ownershipContracts}
    return detectedEvents
}