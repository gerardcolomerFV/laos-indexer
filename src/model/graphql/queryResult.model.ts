import { Arg, Field, ObjectType, Query, Resolver } from 'type-graphql';

@ObjectType()
export class LaosAssetQueryResult {
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

  constructor(props: Partial<LaosAssetQueryResult>) {
    Object.assign(this, props);
  }
}