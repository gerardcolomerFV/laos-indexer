import { Context as RealContext } from '../ownership_chain/processor';
import { Store } from '@subsquid/typeorm-store';

export interface BlockHeader {
  id: string;
  height: number;
  hash: string;
  parentHash: string;
  timestamp: number;
}

export interface LogData {
  id: string;
  logIndex: number;
  transactionIndex: number;
  address: string;
  transactionHash: string;
  data: string;
  topics: string[];
  block: {
    id: string;
    height: number;
    hash: string;
    parentHash: string;
    timestamp: number;
  };
  transaction?: any; // Define the transaction type if needed
  getTransaction: () => any; // Define the return type if needed
}

interface BlockData<T> {
  header: BlockHeader;
  logs: LogData[];
  transactions: T[];
  traces: T[];
  stateDiffs: T[];
}

const mockLogs: LogData[] = [
  {
    id: 'mock-log-id-1',
    logIndex: 0,
    transactionIndex: 0,
    address: "0x52f5de321c9595e7b11f0d91d8c3e816c7d715bb",
    transactionHash: "0x9d2e7d2c2549bc315807d3c304d39a1a8243ee3a3925c97f4b153e5fb587a3d5",
    data: '0x00000000000000000000000052f5de321c9595e7b11f0d91d8c3e816c7d715bb000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c268747470733a2f2f756c6f632e696f2f476c6f62616c436f6e73656e73757328303a307834373536633430343261343331616432626265363164386334623936366331333238653761386461613031313065396262643364343031333133386130626434292f50617261636861696e2832303031292f50616c6c6574496e7374616e6365283531292f4163636f756e744b6579323028307846466646666666464646666646664666466666464646664530303030303030303030303030333661292f000000000000000000000000000000000000000000000000000000000000',
    topics: ['0x74b81bc88402765a52dad72d3d893684f472a679558f3641500e0ee14924a10a'],
    block: {
      id: 'mock-block-id',
      height: 12345,
      hash: 'mock-block-hash',
      parentHash: 'mock-parent-hash',
      timestamp: 1620000000,
    },
    getTransaction: () => ({
      // Define mock transaction data if needed
    }),
  },
  {
    id: 'mock-log-id-2',
    logIndex: 1,
    transactionIndex: 1,
    address: '0xb176c21d6b66d2fe1b0e7c697610163d28000a65',
    transactionHash: '0x537c05ceff5c3940af2002d2178e5fff09ad0d2f1416ab18d3033dc092775b47',
    data: '0x',
    topics: [
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
      "0x000000000000000000000000637b4840c99925d9d9698b4a552c447f1cd155dd",
      "0x000000000000000000000000637b4840c99925d9d9698b4a552c447f1cd155dd",
      "0x09262f22ac59e18000000000637b4840c99925d9d9698b4a552c447f1cd155dd",
    ],
    block: {
      id: 'mock-block-id',
      height: 12345,
      hash: 'mock-block-hash',
      parentHash: 'mock-parent-hash',
      timestamp: 1620000000,
    },
    getTransaction: () => ({
      // Define mock transaction data if needed
    }),
  },
];

export class Context implements RealContext {
  _chain: any;
  log: any;
  store: Store;
  isHead: boolean;
  blocks: BlockData<any>[];

  constructor(_logs: LogData[] = mockLogs) {
    this._chain = {};
    this.log = {};
    this.store = {
      insert: jest.fn(),
      upsert: jest.fn(),
      find: jest.fn(),
    } as unknown as Store;
    this.isHead = true;
    this.blocks = [
      {
        header: {
          id: 'mock-block-id',
          height: 12345,
          hash: 'mock-block-hash',
          parentHash: 'mock-parent-hash',
          timestamp: 1620000000,
        },
        logs: _logs,
        transactions: [],
        traces: [],
        stateDiffs: [],
      },
    ];
  }
}
