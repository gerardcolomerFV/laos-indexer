import { Arg, Query, Resolver } from 'type-graphql';
import type { EntityManager } from 'typeorm';
import { Transfer, LaosAsset, TransferQueryResult, TransferWhereInput, TransferPaginationInput, TransferOrderByOptions } from '../../model';


@Resolver()
export class TransferResolver {
  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => [TransferQueryResult], { nullable: true })
  async transfers(
    @Arg('where', () => TransferWhereInput, { nullable: true }) where?: TransferWhereInput,
    @Arg('pagination', () => TransferPaginationInput, { nullable: true }) pagination?: TransferPaginationInput,
    @Arg('orderBy', () => TransferOrderByOptions, { nullable: true }) orderBy?: TransferOrderByOptions
  ): Promise<TransferQueryResult[]> {
    const manager = await this.tx();

    // Build the query with pagination and filters
    let query = manager.createQueryBuilder(Transfer, 'transfer')
    .innerJoinAndSelect('transfer.asset', 'asset')
    .innerJoinAndSelect('asset.ownershipContract', 'ownershipContract')
    .innerJoin(LaosAsset, 'laosAsset', 'laosAsset.tokenId = asset.tokenId AND laosAsset.laosContract = ownershipContract.laosContract');

    // Add filters based on where input
    if (where) {
      if (where.tokenId) {
        query = query.andWhere('asset.tokenId = :tokenId', { tokenId: where.tokenId });
      }
      if (where.contractAddress) {
        query = query.andWhere('ownershipContract.id = :contractAddress', { contractAddress: where.contractAddress });
      }
      if (where.to) {
        query = query.andWhere('transfer.to = :to', { to: where.to });
      }
      if (where.from) {
        query = query.andWhere('transfer.from = :from', { from: where.from });
      }
    }

    if (orderBy) {
      const orderByOptions = orderBy.split(' ');
      let order: "ASC" | "DESC";
      order = orderByOptions[1] as "ASC" | "DESC";
      query = query.orderBy(orderByOptions[0], order);
    }

    if (pagination) {
      if (pagination.limit) {
        query = query.limit(pagination.limit);
      }
      if (pagination.offset) {
        query = query.offset(pagination.offset);
      }
    }

    const transfers = await query.getMany();

    // Map to TransferQueryResult
    return transfers.map(transfer => new TransferQueryResult({
      from: transfer.from,
      to: transfer.to,
      timestamp: transfer.timestamp,
      blockNumber: transfer.blockNumber,
      txHash: transfer.txHash,
      tokenId: transfer.asset.tokenId.toString(),
      contractAddress: transfer.asset.ownershipContract.id
    }));
  }
}
