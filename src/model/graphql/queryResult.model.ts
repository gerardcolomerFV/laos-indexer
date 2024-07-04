import { Arg, Field, ObjectType, Query, Resolver } from 'type-graphql';

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