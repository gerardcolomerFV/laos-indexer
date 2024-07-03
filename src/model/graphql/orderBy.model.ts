import { registerEnumType } from 'type-graphql';

export enum OrderByOptions {
  TOKEN_ID_ASC = 'token_id ASC',
  TOKEN_ID_DESC = 'token_id DESC',
  OWNER_ASC = 'owner ASC',
  OWNER_DESC = 'owner DESC',
  CREATED_AT_ASC = 'timestamp ASC',
  CREATED_AT_DESC = 'timestamp DESC'
}

registerEnumType(OrderByOptions, {
  name: 'OrderByOptions', 
  description: 'Possible options for ordering tokens' 
});