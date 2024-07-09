import { Arg, Field, InputType, ObjectType, Query, Resolver } from 'type-graphql';
import type { EntityManager } from 'typeorm';
import { TokenOrderByOptions, TokenConnection, TokenEdge, PageInfo, TokenQueryResult, LaosAsset, TokenWhereInput } from '../../model';

@InputType()
class TokenWhereInput {
  @Field({ nullable: true })
  tokenId?: string;

  @Field({ nullable: true })
  contractAddress?: string;

  @Field({ nullable: true })
  owner?: string;
}

@Resolver()
class TokenResolver {
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
        m.block_number,
        m.tx_hash,
        m."timestamp" as "updatedAt",
        tu.fetch_state AS "tokenUriFetchState",
        tu.name AS name,
        tu.description AS description,
        tu.image AS image,
        tu.attributes AS attributes,
        cd.ownership_contract as "contractAddress"
      FROM laos_asset la
      INNER JOIN contract_data cd ON LOWER(la.laos_contract) = cd.laos_contract
      INNER JOIN metadata m ON la.metadata = m.id
      INNER JOIN token_uri tu ON m.token_uri_id = tu.id
      LEFT JOIN asset a ON (la.token_id = a.token_id AND LOWER(cd.ownership_contract) = LOWER(a.ownership_contract_id))
      WHERE la.token_id = $2  AND cd.laos_contract IS NOT null
      `,
      [normalizedOwnershipContractId, tokenId]
    );

    if (result.length === 0) {
      return null;
    }

    const transformedResult = {
      ...result[0],
      createdAt: new Date(result[0].createdAt)
    };

    return new TokenQueryResult(transformedResult);
  }

  @Query(() => TokenConnection, { nullable: true })
  async tokens(
    @Arg('where', () => TokenWhereInput, { nullable: true }) where: TokenWhereInput,
    @Arg('limit', () => Number, { nullable: true }) limit: number,
    @Arg('offset', () => Number, { nullable: true }) offset: number,
    @Arg('orderBy', () => TokenOrderByOptions, { nullable: true }) orderBy: TokenOrderByOptions
  ): Promise<TokenConnection> {
    const manager = await this.tx();

    const effectiveLimit = limit || 10;
    const effectiveOffset = offset || 0;
    const effectiveOrderBy = orderBy || TokenOrderByOptions.CREATED_AT_ASC;

    let conditions = [];
    let parameters = [];

    if (where?.owner) {
      conditions.push('LOWER(COALESCE(a.owner, la.initial_owner)) = LOWER($' + (conditions.length + 1) + ')');
      parameters.push(where.owner.toLowerCase());
    }
    if (where?.contractAddress) {
      conditions.push('LOWER(oc.id) = LOWER($' + (conditions.length + 1) + ')');
      parameters.push(where.contractAddress.toLowerCase());
    }
    if (where?.tokenId) {
      conditions.push('la.token_id = $' + (conditions.length + 1));
      parameters.push(where.tokenId);
    }

    const query = `
      SELECT 
        la.token_id AS "tokenId", 
        COALESCE(a.owner, la.initial_owner) AS "owner",
        la.initial_owner AS "initialOwner",
        la.created_at as "createdAt",
        m.token_uri_id AS "tokenUri",
        m.block_number,
        m.tx_hash,
        m."timestamp" as "updatedAt",
        tu.fetch_state AS "tokenUriFetchState",
        tu.name AS name,
        tu.description AS description,
        tu.image AS image,
        tu.attributes AS attributes,
        oc.id AS "contractAddress"
      FROM laos_asset la
      INNER JOIN ownership_contract oc ON LOWER(la.laos_contract) = LOWER(oc.laos_contract)
      INNER JOIN metadata m ON la.metadata = m.id
      INNER JOIN token_uri tu ON m.token_uri_id = tu.id
      LEFT JOIN asset a ON la.token_id = a.token_id AND a.ownership_contract_id = oc.id
      ${conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''}
      ORDER BY ${effectiveOrderBy}
      LIMIT $${conditions.length + 1} OFFSET $${conditions.length + 2}
    `;

    parameters.push(effectiveLimit, effectiveOffset);

    const tokens = await this.fetchTokens(manager, query, parameters);

    const edges = tokens.map(token => new TokenEdge(token.tokenId, token));

    const pageInfo = new PageInfo({
      endCursor: tokens.length > 0 ? tokens[tokens.length - 1].tokenId : null,
      hasNextPage: tokens.length === effectiveLimit,
      hasPreviousPage: effectiveOffset > 0,
      startCursor: tokens.length > 0 ? tokens[0].tokenId : null,
    });

    return new TokenConnection(edges, pageInfo);
  }
}
