import { 
    BlockHeader, 
    DataHandlerContext, 
    EvmBatchProcessor, 
    EvmBatchProcessorFields, 
    Log as _Log, 
    Transaction as _Transaction 
} from '@subsquid/evm-processor';
import { Store } from '@subsquid/typeorm-store';
import * as EvolutionCollection from '../abi/EvolutionCollection';


//Needs to be introduced all with LowerCase
export const processor = new EvmBatchProcessor()
    .setDataSource({
        chain:  process.env.RPC_LAOS_ENDPOINT!,
    })
    .setFinalityConfirmation(6)
    .setBlockRange({
        from: Number(process.env.STARTING_BLOCK_LAOS),
    })
    .addLog({
        topic0: [EvolutionCollection.events.MintedWithExternalURI.topic, EvolutionCollection.events.EvolvedWithExternalURI.topic]
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
