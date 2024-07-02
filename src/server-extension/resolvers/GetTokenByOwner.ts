import { Arg, Query, Resolver } from 'type-graphql';
import type { EntityManager } from 'typeorm';
import { LaosAssetQueryResult } from './GetToken';

@Resolver()
export class GetTokenByOwner {
  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => [LaosAssetQueryResult], { nullable: true })
  async getTokensByOwner(
    @Arg('owner', () => String) owner: string
  ): Promise<LaosAssetQueryResult[]> {
    const manager = await this.tx();
    const normalizedOwner = owner.toLowerCase();

    const results = await manager.query(
      `
      SELECT 
        la.token_id AS "tokenId", 
        COALESCE(a.owner, la.initial_owner) AS owner,
        la.initial_owner as "initialOwner",
        m."timestamp" as "createdAt",
        m.token_uri_id AS "tokenUri",
        oc.id as "contractAddress"
      FROM laos_asset la
      INNER JOIN ownership_contract oc ON LOWER(la.laos_contract) = LOWER(oc.laos_contract)
      LEFT JOIN metadata m ON la.metadata = m.id
      LEFT JOIN asset a ON la.token_id = a.token_id AND a.ownership_contract_id = oc.id
      WHERE LOWER(COALESCE(a.owner, la.initial_owner)) = LOWER($1)
      `,
      [normalizedOwner]
    );

    return results.map((result: any) => {
      return new LaosAssetQueryResult({
        ...result,
        createdAt: new Date(result.createdAt),
      });
    });
  }
}
