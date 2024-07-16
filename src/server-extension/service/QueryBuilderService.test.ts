// src/service/QueryBuilderService.test.ts
import { QueryBuilderService } from './QueryBuilderService';
import { TokenOrderByOptions, TokenPaginationInput, TokenWhereInput } from '../../model';

describe('QueryBuilderService', () => {
  let queryBuilderService: QueryBuilderService;

  beforeEach(() => {
    queryBuilderService = new QueryBuilderService();
  });

  describe('buildTokenQuery', () => {
    it('should build a query without where conditions', async () => {
      const where: TokenWhereInput = {};
      const pagination: TokenPaginationInput = { first: 10 };
      const { query, parameters } = await queryBuilderService.buildTokenQuery(where, pagination);

      expect(query).toContain('SELECT');
      expect(query).toContain('ORDER BY');
      expect(query).toContain('LIMIT $1');
      expect(parameters).toEqual([11]); // Default pagination.first + 1
    });

    it('should build a query with owner condition', async () => {
      const where: TokenWhereInput = { owner: '0x123' };
      const pagination: TokenPaginationInput = { first: 10 };
      const { query, parameters } = await queryBuilderService.buildTokenQuery(where, pagination);

      expect(query).toContain('LOWER(COALESCE(a.owner, la.initial_owner)) = LOWER($1)');
      expect(query).toContain('LIMIT $2');
      expect(parameters).toEqual(['0x123', 11]); // owner + pagination.first + 1
    });

    it('should build a query with contractAddress condition', async () => {
      const where: TokenWhereInput = { contractAddress: '0xabc' };
      const pagination: TokenPaginationInput = { first: 10 };
      const { query, parameters } = await queryBuilderService.buildTokenQuery(where, pagination);

      expect(query).toContain('LOWER(oc.id) = LOWER($1)');
      expect(parameters).toEqual(['0xabc', 11]); // contractAddress + pagination.first + 1
    });

    it('should build a query with after cursor', async () => {
      const where: TokenWhereInput = {};
      const pagination: TokenPaginationInput = { first: 10, after: Buffer.from('1609459200000:10:0xabc').toString('base64') };
      const { query, parameters } = await queryBuilderService.buildTokenQuery(where, pagination);

      expect(query).toContain('to_timestamp($1 / 1000.0)');
      expect(query).toContain('la.log_index > $2');
      expect(query).toContain('LOWER(oc.id) > LOWER($3)');
      expect(query).toContain('LIMIT $4');
      expect(parameters).toEqual(["1609459200000", "10", '0xabc', 11]); // afterCreatedAt, afterLogIndex, afterContractId + pagination.first + 1
    });
    
    it('should build a query with after cursor and orderBy', async () => {
      const where: TokenWhereInput = {};
      const pagination: TokenPaginationInput = { first: 10, after: Buffer.from('1609459200000:10:0xabc').toString('base64') };
      const orderBy = TokenOrderByOptions.CREATED_AT_DESC;
      const { query, parameters } = await queryBuilderService.buildTokenQuery(where, pagination, orderBy);
      expect(query).toContain('to_timestamp($1 / 1000.0)');
      expect(query).toContain('la.log_index < $2');
      expect(query).toContain('LOWER(oc.id) > LOWER($3)');
      expect(query).toContain('ORDER BY created_at DESC, la.log_index DESC, oc.id ASC');
    });
  });

  describe('buildTokenByIdQuery', () => {
    it('should build a query with ownershipContractId and tokenId', async () => {
      const ownershipContractId = '0xabc';
      const tokenId = '1';
      const { query, parameters } = await queryBuilderService.buildTokenByIdQuery(ownershipContractId, tokenId);

      expect(query).toContain('WITH contract_data AS');
      expect(query).toContain('WHERE LOWER(id) = $1');
      expect(query).toContain('la.token_id = $2');
      expect(parameters).toEqual(['0xabc', '1']); // ownershipContractId, tokenId
    });
  });
});
