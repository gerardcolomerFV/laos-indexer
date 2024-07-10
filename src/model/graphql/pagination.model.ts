import { InputType, Field } from 'type-graphql';
import { TransferOrderByOptions, TokenOrderByOptions, TokenHistoryOrderByOptions } from '../../model';

@InputType()
 class PaginationInput {
  @Field(() => Number, { nullable: true })
  limit?: number;

  @Field(() => Number, { nullable: true })
  offset?: number;
}

@InputType()
export class TransferPaginationInput extends PaginationInput {
}

@InputType()
export class TokenPaginationInput  {
  @Field(() => Number, { nullable: true })
  first?: number;

  @Field(() => String, { nullable: true })
  after?: string;
}


@InputType()
export class TokenHistoryPaginationInput extends PaginationInput {
  @Field(() => TokenHistoryOrderByOptions, { nullable: true })
  orderBy?: TokenHistoryOrderByOptions;
}