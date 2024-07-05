import { Field, ObjectType } from 'type-graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class TokenQueryResult {
  @Field(() => String, { nullable: false })
  tokenId!: string;

  @Field(() => String, { nullable: false })
  owner!: string;

  @Field(() => String, { nullable: true })
  tokenUri!: string | null;

  @Field(() => String, { nullable: true })
  contractAddress!: string | null;

  @Field(() => Date, { nullable: false })
  createdAt!: Date;

  @Field(() => String, { nullable: false })
  initialOwner!: string;

  @Field(() => String, { nullable: true })
  name!: string;

  @Field(() => String, { nullable: true })
  description!: string;

  @Field(() => String, { nullable: true })
  image!: string | null;

  @Field(() => GraphQLJSON, { nullable: true })
  attributes!: Record<string, any> | null;

  @Field(() => Number, { nullable: false })
  block_number!: number;

  @Field(() => String, { nullable: false })
  tx_hash!: string;

  constructor(props: Partial<TokenQueryResult>) {
    Object.assign(this, props);
  }
}

@ObjectType()
export class TransferQueryResult {
  
  @Field(() => String, { nullable: false })
  from!: string

  @Field(() => String, { nullable: false })
  to!: string

  @Field(() => Date, { nullable: false })
  timestamp!: Date

  @Field(() => Number, { nullable: false })
  blockNumber!: number

  @Field(() => String, { nullable: false })
  txHash!: string

  @Field(() => String, { nullable: false })
  tokenId!: string;

  @Field(() => String, { nullable: true })
  contractAddress!: string | null;

  constructor(props: Partial<TransferQueryResult>) {
    Object.assign(this, props);
  }
}




@ObjectType()
export class TokenHistoryQueryResult {

  @Field(() => String, { nullable: true })
  contractAddress!: string | null;

  @Field(() => String, { nullable: false })
  laosCollection!: string;

  @Field(() => String, { nullable: true })
  tokenUri!: string;

  @Field(() => String, { nullable: true })
  name!: string;

  @Field(() => String, { nullable: true })
  description!: string;

  @Field(() => String, { nullable: true })
  image!: string | null;

  @Field(() => GraphQLJSON, { nullable: true })
  attributes!: Record<string, any> | null;

  @Field(() => Number, { nullable: false })
  block_number!: number;

  @Field(() => String, { nullable: false })
  tx_hash!: string;

  @Field(() => Date, { nullable: false })
  updatedAt!: Date;

  constructor(init: Partial<TokenHistoryQueryResult>) {
    Object.assign(this, init);
  }
}
