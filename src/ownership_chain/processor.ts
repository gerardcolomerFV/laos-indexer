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
    .setGateway('https://v2.archive.subsquid.io/network/polygon-mainnet')
    .setDataSource({
        chain: process.env.RPC_ENDPOINT!,
    })
    .setFinalityConfirmation(75)
    .setBlockRange({
        // from: 55830815, // Block in polygon when LAOS SUN was deployed
        from: 59228102, // first valid contract deployed in polygon pointing to LAOS SUN
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
