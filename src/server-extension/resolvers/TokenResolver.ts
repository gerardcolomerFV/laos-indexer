import { Arg, Field, InputType, ObjectType, Query, Resolver } from 'type-graphql';
import type { EntityManager } from 'typeorm';
import { TokenOrderByOptions, TokenPaginationInput, TokenConnection, TokenEdge, PageInfo, TokenQueryResult, LaosAsset, TokenWhereInput } from '../../model';


@Resolver()
export class TokenResolver {
  constructor(private tx: () => Promise<EntityManager>) { }

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
        tu.state AS "tokenUriFetchState",
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
    @Arg('pagination', () => TokenPaginationInput, { nullable: true }) pagination?: TokenPaginationInput,
    @Arg('orderBy', () => TokenOrderByOptions, { nullable: true }) orderBy?: TokenOrderByOptions
  ): Promise<TokenConnection> {
    const manager = await this.tx();

    const effectiveFirst = pagination?.first || 10; // Default to 10 if first is not provided
    const afterCursor = pagination?.after; // Cursor from the previous query
    const effectiveOrderBy = orderBy || TokenOrderByOptions.CREATED_AT_ASC;

    let conditions = [];
    let parameters = [];

    // Add conditions based on the `where` input
    if (where?.owner) {
      conditions.push('LOWER(COALESCE(a.owner, la.initial_owner)) = LOWER($' + (conditions.length + 1) + ')');
      parameters.push(where.owner.toLowerCase());
    }
    if (where?.contractAddress) {
      conditions.push('LOWER(oc.id) = LOWER($' + (conditions.length + 1) + ')');
      parameters.push(where.contractAddress.toLowerCase());
    }

    // Handle the `after` cursor
    if (afterCursor) {
      // Decode the cursor to get the actual value
      const afterCreatedAt = parseInt(Buffer.from(afterCursor, 'base64').toString('ascii'), 10);
      if (effectiveOrderBy === TokenOrderByOptions.CREATED_AT_ASC) {
        conditions.push('"la"."created_at" > to_timestamp($' + (conditions.length + 1) + ' / 1000.0)');
      } else {
        conditions.push('"la"."created_at" < to_timestamp($' + (conditions.length + 1) + ' / 1000.0)');
      }
      parameters.push(afterCreatedAt);
    }

    // Assemble the SQL query with parameters for limit
    const query = `
    SELECT 
      la.token_id AS "tokenId", 
      COALESCE(a.owner, la.initial_owner) AS "owner",
      la.initial_owner AS "initialOwner",
      la.created_at AS "createdAt", -- Return as a timestamp
      m.token_uri_id AS "tokenUri",
      m.block_number,
      m.tx_hash,
      m."timestamp" as "updatedAt",
      tu.state AS "tokenUriFetchState",
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
    LIMIT $${conditions.length + 1}
  `;

    // Add the limit (effectiveFirst + 1) to the parameters array
    parameters.push(effectiveFirst + 1); // Fetch one extra record to check for the next page

    const tokens = await this.fetchTokens(manager, query, parameters);

    // Determine if there is a next page by checking if more than effectiveFirst records were fetched
    const hasNextPage = tokens.length > effectiveFirst;

    // Trim the extra record if it exists
    if (hasNextPage) {
      tokens.pop();
    }

    // Create edges with cursors
    const edges = tokens.map(token => ({
      cursor: Buffer.from(new Date(token.createdAt).getTime().toString()).toString('base64'), // Convert numeric timestamp to base64
      node: {
        ...token,
        createdAt: new Date(token.createdAt) // Ensure createdAt is a Date object
      }
    }));

    // Create PageInfo
    const pageInfo = new PageInfo({
      endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : undefined,
      hasNextPage: hasNextPage,
      hasPreviousPage: Boolean(afterCursor),
      startCursor: edges.length > 0 ? edges[0].cursor : undefined,
    });

    return new TokenConnection(edges, pageInfo);
  }



}