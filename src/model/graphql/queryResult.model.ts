import { ObjectType, Field } from 'type-graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class PageInfo {
  @Field(() => String, { nullable: true })
  endCursor?: string;

  @Field(() => Boolean, { nullable: true })
  hasNextPage?: boolean;

  @Field(() => Boolean, { nullable: true })
  hasPreviousPage?: boolean;

  @Field(() => String, { nullable: true })
  startCursor?: string;

  constructor(props: Partial<PageInfo>) {
    Object.assign(this, props);
  }
}

@ObjectType()
export class TokenQueryResult {
  @Field(() => String, { nullable: false })
  tokenId!: string;

  @Field(() => String, { nullable: false })
  owner!: string;

  @Field(() => String, { nullable: true })
  tokenUri!: string | null;

  @Field(() => String, { nullable: true })
  tokenUriFetchState!: string;

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

  constructor(props: Partial<TokenQueryResult>) {
    Object.assign(this, props);
  }
}

@ObjectType()
export class TokenQueryResultSelect extends TokenQueryResult {     

  @Field(() => Number, { nullable: false })
  logIndex!: number;

  constructor(props: Partial<TokenQueryResultSelect>) {
    super(props);
    Object.assign(this, props);
  }
}


@ObjectType()
export class TokenEdge {
  @Field(() => String)
  cursor!: string;

  @Field(() => TokenQueryResult)
  node!: TokenQueryResult;

  constructor(cursor: string, node: TokenQueryResult) {
    this.cursor = cursor;
    this.node = node;
  }
}

@ObjectType()
export class TokenConnection {
  @Field(() => [TokenEdge])
  edges!: TokenEdge[];

  @Field(() => PageInfo)
  pageInfo!: PageInfo;

  constructor(edges: TokenEdge[], pageInfo: PageInfo) {
    this.edges = edges;
    this.pageInfo = pageInfo;
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

  @Field(() => String, { nullable: true })
  tokenUri!: string;

  @Field(() => String, { nullable: true })
  tokenUriFetchState!: string;

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
