import { Arg, Query, Resolver } from 'type-graphql';
import type { EntityManager } from 'typeorm';
import { LaosAssetQueryResult } from './GetToken';
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


@Resolver()
export class GetTokenByOwner {
  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => [LaosAssetQueryResult], { nullable: true })
  async getTokensByOwner(
    @Arg('owner', () => String) owner: string,
    @Arg('limit', () => Number, { nullable: true }) limit: number,
    @Arg('offset', () => Number, { nullable: true }) offset: number,
    @Arg('orderBy', () => OrderByOptions, { nullable: true }) orderBy: OrderByOptions,
  ): Promise<LaosAssetQueryResult[]> {
    const manager = await this.tx();
    const normalizedOwner = owner.toLowerCase();
    
    const effectiveLimit = limit || 10;
    const effectiveOffset = offset || 0;
    const effectiveOrderBy = orderBy || OrderByOptions.CREATED_AT_ASC; 
    
    const results = await manager.query(
      `
      SELECT 
        la.token_id AS "tokenId", 
        COALESCE(a.owner, la.initial_owner) AS "owner",
        la.initial_owner AS "initialOwner",
        m.timestamp AS "createdAt",  -- Use alias to match the result object field
        m.token_uri_id AS "tokenUri",
        oc.id AS "contractAddress"
      FROM laos_asset la
      INNER JOIN ownership_contract oc ON LOWER(la.laos_contract) = LOWER(oc.laos_contract)
      LEFT JOIN metadata m ON la.metadata = m.id
      LEFT JOIN asset a ON la.token_id = a.token_id AND a.ownership_contract_id = oc.id
      WHERE LOWER(COALESCE(a.owner, la.initial_owner)) = LOWER($1)
      ORDER BY ${effectiveOrderBy}
      LIMIT $2 OFFSET $3
      `,
      [normalizedOwner, effectiveLimit, effectiveOffset]
    );

    return results.map((result: any) => {
      return new LaosAssetQueryResult({
        ...result,
        createdAt: new Date(result.createdAt), 
      });
    });
  }
}