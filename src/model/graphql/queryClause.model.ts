import { Field, InputType } from 'type-graphql';

@InputType()
export class TransferWhereInput {
  @Field({ nullable: true })
  tokenId?: string;

  @Field({ nullable: true })
  contractAddress?: string;

  @Field({ nullable: true })
  to?: string;

  @Field({ nullable: true })
  from?: string;
}

@InputType()
export class TokenWhereInput {

  @Field({ nullable: true })
  contractAddress?: string;

  @Field({ nullable: true })
  owner?: string;

}