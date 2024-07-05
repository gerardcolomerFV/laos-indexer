import { Field, InputType } from 'type-graphql';

@InputType()
export class TransferWhereInput {
  @Field({ nullable: true })
  tokenId?: string;

  @Field({ nullable: true })
  contractAddress?: string;
}
