import { registerEnumType } from 'type-graphql';

export interface IOrderByOptions {
  field: string;
  direction: 'ASC' | 'DESC';
}

export enum TransferOrderByOptions {
  TIMESTAMP_ASC = 'timestamp ASC',
  TIMESTAMP_DESC = 'timestamp DESC',
  BLOCKNUMBER_ASC = 'block_number ASC',
  BLOCKNUMBER_DESC = 'block_number DESC',
}

export enum TokenOrderByOptions {
  CREATED_AT_ASC = 'created_at ASC',
  CREATED_AT_DESC = 'created_at DESC',
}

export enum TokenHistoryOrderByOptions {
  UPDATED_AT_ASC = 'timestamp ASC',
  UPDATED_AT_DESC = 'timestamp DESC',
}



// Register TransferOrderByOptions
registerEnumType(TransferOrderByOptions, {
  name: 'TransferOrderByOptions',
  description: 'Possible options for ordering transfers',
});

// Register AssetOrderByOptions
registerEnumType(TokenOrderByOptions, {
  name: 'TokenOrderByOptions',
  description: 'Possible options for ordering tokens',
});

registerEnumType(TokenHistoryOrderByOptions, {
  name: 'TokenHistoryOrderByOptions',
  description: 'Possible options for ordering token histories',
});

export type OrderByOptions = TransferOrderByOptions | TokenOrderByOptions | TokenHistoryOrderByOptions;