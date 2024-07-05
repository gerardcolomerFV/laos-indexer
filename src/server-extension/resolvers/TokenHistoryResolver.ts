import { Arg, Query, Resolver } from 'type-graphql';
import type { EntityManager } from 'typeorm';
import { TokenHistoryQueryResult, TokenHistoryPaginationInput, TokenHistoryOrderByOptions } from '../../model';

@Resolver()
export class TokenHistoryResolver {
  constructor(private tx: () => Promise<EntityManager>) {}

  private async fetchTokenHistory(
    manager: EntityManager,
    query: string,
    parameters: any[]
  ): Promise<TokenHistoryQueryResult[]> {
    const results = await manager.query(query, parameters);

    return results.map((result: any) => {
      return new TokenHistoryQueryResult({
        ...result,
        updatedAt: new Date(result.updatedAt),
      });
    });
  }

  @Query(() => [TokenHistoryQueryResult], { nullable: true })
  async tokenHistory(
    @Arg('ownershipContractId', () => String) ownershipContractId: string,
    @Arg('tokenId', () => String) tokenId: string,
    @Arg('pagination', () => TokenHistoryPaginationInput, { nullable: true }) pagination: TokenHistoryPaginationInput
  ): Promise<TokenHistoryQueryResult[] | null> {
    const manager = await this.tx();
    const normalizedOwnershipContractId = ownershipContractId.toLowerCase(); // Convert to lowercase

    const effectiveLimit = pagination?.limit || 10;
    const effectiveOffset = pagination?.offset || 0;
    const effectiveOrderBy = pagination?.orderBy || TokenHistoryOrderByOptions.UPDATED_AT_DESC;

    const query = `
      SELECT 
        la.laos_contract AS "laosCollection", 
        tu.id AS "tokenUri",
        tu.name AS name,
        tu.description AS description,
        tu.image AS image,
        tu.attributes AS attributes,
        m.block_number,
        m.tx_hash,
        m."timestamp" as "updatedAt",
        oc.id AS "contractAddress"
      FROM 
        public.metadata m
      INNER JOIN 
        public.laos_asset la ON m.laos_asset_id = la.id
      INNER JOIN 
        public.ownership_contract oc ON LOWER(la.laos_contract) = LOWER(oc.laos_contract)
      LEFT JOIN 
        public.token_uri tu ON m.token_uri_id = tu.id
      WHERE 
        la.token_id = $1
        AND LOWER(oc.id) = $2
      ORDER BY ${effectiveOrderBy}
      LIMIT $3 OFFSET $4;
    `;

    const results = await this.fetchTokenHistory(manager, query, [tokenId, normalizedOwnershipContractId, effectiveLimit, effectiveOffset]);

    return results.length > 0 ? results : null;
  }
}
