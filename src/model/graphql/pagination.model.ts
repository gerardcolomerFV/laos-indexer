import { InputType, Field, Int } from 'type-graphql';
import { Min, Max, IsNotEmpty } from "class-validator";
import { TransferOrderByOptions, TokenOrderByOptions, TokenHistoryOrderByOptions } from '../../model';

@InputType()
 class PaginationInput {
  @Field(() => Int, { nullable: false })
  @Min(0)
  @Max(100)
  @IsNotEmpty()
  limit!: number;

  @Field(() => Int, { nullable: false, defaultValue: 0 })
  offset: number = 0;
}

@InputType()
export class TransferPaginationInput extends PaginationInput {
}

@InputType()
export class TokenPaginationInput  {
  @Field(() => Int, { nullable: false })
  @Min(0)
  @Max(100)
  @IsNotEmpty()
  first!: number ;

  @Field(() => String, { nullable: true })
  after?: string;

  
}


@InputType()
export class TokenHistoryPaginationInput extends PaginationInput {
  @Field(() => TokenHistoryOrderByOptions, { nullable: true })
  orderBy?: TokenHistoryOrderByOptions;
}