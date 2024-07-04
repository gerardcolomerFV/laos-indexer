import { Arg, Field, ObjectType, Query, Resolver } from 'type-graphql';
import type { EntityManager } from 'typeorm';
import { LaosAsset, TokenQueryResult, TokenOrderByOptions, TokenPaginationInput } from '../../model';


@Resolver()
export class TokenResolver {
  constructor(private tx: () => Promise<EntityManager>) {}

  private async fetchTokens(
    manager: EntityManager,
    query: string,
    parameters: any[]
  ): Promise<TokenQueryResult[]> {
    const results = await manager.query(query, parameters);

    return results.map((result: any) => {
      return new TokenQueryResult({
        ...result,
        createdAt: new Date(result.createdAt),
      });
    });
  }

  @Query(() => Number)
  async totalLaosAssets(): Promise<number> {
    const manager = await this.tx();
    return await manager.getRepository(LaosAsset).count();
  }

  @Query(() => TokenQueryResult, { nullable: true })
  async token(
    @Arg('ownershipContractId', () => String) ownershipContractId: string,
    @Arg('tokenId', () => String) tokenId: string
  ): Promise<TokenQueryResult | null> {
    const manager = await this.tx();
    const normalizedOwnershipContractId = ownershipContractId.toLowerCase(); // Convert to lowercase

    const result = await manager.query(
      `
       WITH contract_data AS (
        SELECT LOWER(laos_contract) AS laos_contract,
        LOWER(id) as ownership_contract
        FROM ownership_contract
        WHERE LOWER(id) = $1
      )
      SELECT 
        la.token_id AS "tokenId",
        COALESCE(a.owner, la.initial_owner) AS owner,
        la.initial_owner as "initialOwner",
        la.created_at as "createdAt",
        m.token_uri_id AS "tokenUri",
        cd.ownership_contract as "contractAddress"
        
      FROM laos_asset la
      LEFT JOIN contract_data cd ON LOWER(la.laos_contract) = cd.laos_contract
      LEFT JOIN metadata m ON la.metadata = m.id
      LEFT JOIN asset a ON la.token_id = a.token_id AND LOWER(cd.ownership_contract) = LOWER(a.ownership_contract_id)
      WHERE la.token_id = $2  AND cd.laos_contract IS NOT null
      `,
      [normalizedOwnershipContractId, tokenId]
    );

    if (result.length === 0) {
      return null;
    }

    // Convert createdAt from string to Date
    const transformedResult = {
      ...result[0],
      createdAt: new Date(result[0].createdAt)
    };

    return new TokenQueryResult(transformedResult);
  }

  @Query(() => [TokenQueryResult], { nullable: true })
  async tokensByOwner(
    @Arg('owner', () => String) owner: string,
    @Arg('pagination', () => TokenPaginationInput, { nullable: true }) pagination: TokenPaginationInput
  ): Promise<TokenQueryResult[]> {
    const manager = await this.tx();
    const normalizedOwner = owner.toLowerCase();

    const effectiveLimit = pagination?.limit || 10;
    const effectiveOffset = pagination?.offset || 0;
    const effectiveOrderBy = pagination?.orderBy || TokenOrderByOptions.CREATED_AT_ASC;

    const query = `
      SELECT 
        la.token_id AS "tokenId", 
        COALESCE(a.owner, la.initial_owner) AS "owner",
        la.initial_owner AS "initialOwner",
        la.created_at as "createdAt",
        m.token_uri_id AS "tokenUri",
        oc.id AS "contractAddress"
      FROM laos_asset la
      INNER JOIN ownership_contract oc ON LOWER(la.laos_contract) = LOWER(oc.laos_contract)
      LEFT JOIN metadata m ON la.metadata = m.id
      LEFT JOIN asset a ON la.token_id = a.token_id AND a.ownership_contract_id = oc.id
      WHERE LOWER(COALESCE(a.owner, la.initial_owner)) = LOWER($1)
      ORDER BY ${effectiveOrderBy}
      LIMIT $2 OFFSET $3
    `;

    return this.fetchTokens(manager, query, [normalizedOwner, effectiveLimit, effectiveOffset]);
  }

  @Query(() => [TokenQueryResult], { nullable: true })
  async tokensByCollection(
    @Arg('collectionId', () => String) collectionId: string,
    @Arg('pagination', () => TokenPaginationInput, { nullable: true }) pagination: TokenPaginationInput
  ): Promise<TokenQueryResult[]> {
    const manager = await this.tx();

    const effectiveLimit = pagination?.limit || 10;
    const effectiveOffset = pagination?.offset || 0;
    const effectiveOrderBy = pagination?.orderBy || TokenOrderByOptions.CREATED_AT_ASC;

    const query = `
      SELECT 
        la.token_id AS "tokenId", 
        COALESCE(a.owner, la.initial_owner) AS "owner",
        la.initial_owner AS "initialOwner",
        la.created_at as "createdAt",
        m.token_uri_id AS "tokenUri",
        oc.id AS "contractAddress"
      FROM laos_asset la
      INNER JOIN ownership_contract oc ON LOWER(la.laos_contract) = LOWER(oc.laos_contract)
      LEFT JOIN metadata m ON la.metadata = m.id
      LEFT JOIN asset a ON la.token_id = a.token_id AND a.ownership_contract_id = oc.id
      WHERE LOWER(oc.id) = LOWER($1)
      ORDER BY ${effectiveOrderBy}
      LIMIT $2 OFFSET $3
    `;

    return this.fetchTokens(manager, query, [collectionId, effectiveLimit, effectiveOffset]);
  }
}

