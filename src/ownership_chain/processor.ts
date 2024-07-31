import { 
    BlockHeader, 
    DataHandlerContext, 
    EvmBatchProcessor, 
    EvmBatchProcessorFields, 
    Log as _Log, 
    Transaction as _Transaction 
} from '@subsquid/evm-processor';
import { Store } from '@subsquid/typeorm-store';
import * as ERC721UniversalContract from '../abi/UniversalContract'

export const processor = new EvmBatchProcessor()
    .setGateway(process.env.GATEWAY_ENDPOINT!)
    .setDataSource({
        chain: process.env.RPC_ENDPOINT!,
    })
    .setFinalityConfirmation(200)
    .setBlockRange({        
        from: Number(process.env.STARTING_BLOCK_OWNERSHIP),
    })
    .addLog({
       topic0: [ ERC721UniversalContract.events.NewERC721Universal.topic, ERC721UniversalContract.events.Transfer.topic]
    })
    .setFields({
        log: {
            transactionHash: true
        }
    });

export type Fields = EvmBatchProcessorFields<typeof processor>;
export type Context = DataHandlerContext<Store, Fields>;
export type Block = BlockHeader<Fields>;
export type Log = _Log<Fields>;
export type Transaction = _Transaction<Fields>;
