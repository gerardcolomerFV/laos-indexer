import { Arg, Query, Resolver } from 'type-graphql';
import type { EntityManager } from 'typeorm';
import { Transfer, LaosAsset, TransferQueryResult, TransferWhereInput, TransferPaginationInput } from '../../model';


@Resolver()
export class TransferResolver {
  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => [TransferQueryResult], { nullable: true })
  async transfers(
    @Arg('where', () => TransferWhereInput, { nullable: true }) where?: TransferWhereInput,
    @Arg('pagination', () => TransferPaginationInput, { nullable: true }) pagination?: TransferPaginationInput
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
    }

    // Add pagination options
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
