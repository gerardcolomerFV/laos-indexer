import {TypeormDatabase} from '@subsquid/typeorm-store'
import {processor, CONTRACT_ADDRESS, Context} from './processor'
import * as ERC721UniversalContract from '../abi/UniversalContract'

import {Multicall} from '../abi/multicall'



processor.run(new TypeormDatabase({supportHotBlocks: true, stateSchema: 'ownership_chain_processor'}), async (ctx) => {
    let rawTransfers: RawTransfer[] = getRawTransfers(ctx)
})

interface RawTransfer {
    id: string
    tokenId: bigint
    from: string
    to: string
    timestamp: Date
    blockNumber: number
    txHash: string
}

function getRawTransfers(ctx: Context ): RawTransfer[] {
    let transfers: RawTransfer[] = []
    /* get contractListFromDB **/
    
    for (let block of ctx.blocks) {
        for (let log of block.logs) {
          if (log.topics[0] === ERC721UniversalContract.events.NewERC721Universal.topic) {
            console.log('********************************************************************')
            console.log(ERC721UniversalContract.events.NewERC721Universal.decode(log))
            // push to list to contractListFromDB
            console.log('********************************************************************')
          }
          // TODO add inmemory

          // if log.address is inside of list from db AND!!! new dioscovered contract in this batch
            if (log.address === CONTRACT_ADDRESS && log.topics[0] === ERC721UniversalContract.events.Transfer.topic) {
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

    return transfers
}