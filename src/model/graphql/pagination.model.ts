import { InputType, Field } from 'type-graphql';
import { TransferOrderByOptions, TokenOrderByOptions } from '../../model';


// @InputType()
// export class PaginationInput {
//   @Field(() => Number, { nullable: true })
//   limit?: number;

//   @Field(() => Number, { nullable: true })
//   offset?: number;

//   @Field(() => OrderByOptions, { nullable: true })
//   orderBy?: OrderByOptions;
// }

@InputType()
export class TransferPaginationInput {
  @Field(() => Number, { nullable: true })
  limit?: number;

  @Field(() => Number, { nullable: true })
  offset?: number;

  @Field(() => TransferOrderByOptions, { nullable: true })
  orderBy?: TransferOrderByOptions;
}

@InputType()
export class TokenPaginationInput {
  @Field(() => Number, { nullable: true })
  limit?: number;

  @Field(() => Number, { nullable: true })
  offset?: number;

  @Field(() => TokenOrderByOptions, { nullable: true })
  orderBy?: TokenOrderByOptions;
}