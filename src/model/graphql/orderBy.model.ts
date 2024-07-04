import { registerEnumType } from 'type-graphql';

export interface IOrderByOptions {
  field: string;
  direction: 'ASC' | 'DESC';
}

export enum TransferOrderByOptions {
  TIMESTAMP_ASC = 'timestamp ASC',
  TIMESTAMP_DESC = 'timestamp DESC',
}

export enum TokenOrderByOptions {
  CREATED_AT_ASC = 'timestamp ASC',
  CREATED_AT_DESC = 'timestamp DESC',
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

export type OrderByOptions = TransferOrderByOptions | TokenOrderByOptions;