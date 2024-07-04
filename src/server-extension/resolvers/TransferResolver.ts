import { Arg, Field, ObjectType, Query, Resolver } from 'type-graphql';
import type { EntityManager } from 'typeorm';
import { Transfer, TransferQueryResult, TransferOrderByOptions, TransferPaginationInput , TokenQueryResult } from '../../model';


@Resolver()
export class TransferResolver {
  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => [TransferQueryResult], { nullable: true })
  async transfers(
    @Arg('pagination', () => TransferPaginationInput, { nullable: true }) pagination?: TransferPaginationInput
  ): Promise<TransferQueryResult[]> {
    const manager = await this.tx();

    // Build the query with pagination
    let query = manager.createQueryBuilder(Transfer, 'transfer')
                      .leftJoinAndSelect('transfer.asset', 'asset')
                      .leftJoinAndSelect('asset.ownershipContract', 'ownershipContract');

    if (pagination) {
      if (pagination.orderBy) {
        const orderBy = pagination.orderBy.split(' ');
        let order: "ASC" | "DESC";
        order = orderBy[1] as "ASC" | "DESC";
        query = query.orderBy(orderBy[0], order);
      }
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
