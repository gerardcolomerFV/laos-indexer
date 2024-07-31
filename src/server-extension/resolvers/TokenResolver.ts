import { Arg, Query, Resolver } from 'type-graphql';
import { EntityManager } from 'typeorm';
import { TokenOrderByOptions, TokenPaginationInput, TokenConnection, TokenQueryResult, TokenQueryResultSelect, TokenWhereInput, PageInfo } from '../../model';
import { QueryBuilderService } from '../service/QueryBuilderService';

@Resolver()
export class TokenResolver {
  private queryBuilderService: QueryBuilderService;

  constructor(private tx: () => Promise<EntityManager>) {
    this.queryBuilderService = new QueryBuilderService();
  }

  private async fetchTokens(
    manager: EntityManager,
    query: string,
    parameters: any[]
  ): Promise<TokenQueryResultSelect[]> {
    const results = await manager.query(query, parameters);

    return results.map((result: any) => {
      return new TokenQueryResultSelect({
        ...result,
        createdAt: new Date(result.createdAt),
      });
    });
  }

  @Query(() => TokenQueryResult, { nullable: true })
  async token(
    @Arg('contractAddress', () => String) contractAddress: string,
    @Arg('tokenId', () => String) tokenId: string
  ): Promise<TokenQueryResult | null> {
    const manager = await this.tx();
    const { query, parameters } = await this.queryBuilderService.buildTokenByIdQuery(contractAddress, tokenId);
    const result = await manager.query(query, parameters);

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
    @Arg('pagination', () => TokenPaginationInput, { nullable: false, defaultValue: { first: 10 } }) pagination: TokenPaginationInput,
    @Arg('orderBy', () => TokenOrderByOptions, { nullable: true }) orderBy?: TokenOrderByOptions
  ): Promise<TokenConnection> {
    const manager = await this.tx();

    const { query, parameters } = await this.queryBuilderService.buildTokenQuery(where, pagination, orderBy);

    const tokens = await this.fetchTokens(manager, query, parameters);
    const hasNextPage = tokens.length > pagination.first;

    if (hasNextPage) {
      tokens.pop();
    }

    const edges = tokens.map(token => ({
      cursor: Buffer.from(`${new Date(token.createdAt).getTime()}:${token.logIndex}:${token.contractAddress}`).toString('base64'),
      node: {
        ...token,
        createdAt: new Date(token.createdAt)
      }
    }));

    const pageInfo = new PageInfo({
      endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : undefined,
      hasNextPage: hasNextPage,
      hasPreviousPage: Boolean(pagination.after),
      startCursor: edges.length > 0 ? edges[0].cursor : undefined,
    });

    return new TokenConnection(edges, pageInfo);
  }
}
