import { Arg, Field, ObjectType, Query, Resolver } from 'type-graphql';
import type { EntityManager } from 'typeorm';
import { LaosAsset, LaosAssetQueryResult } from '../../model';


@Resolver()
export class GetToken {
  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => Number)
  async totalLaosAssets(): Promise<number> {
    const manager = await this.tx();
    return await manager.getRepository(LaosAsset).count();
  }

  @Query(() => LaosAssetQueryResult, { nullable: true })
  async getToken(
    @Arg('ownershipContractId', () => String) ownershipContractId: string,
    @Arg('tokenId', () => String) tokenId: string
  ): Promise<LaosAssetQueryResult | null> {
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
        m."timestamp" as "createdAt",
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

    return new LaosAssetQueryResult(transformedResult);
  }
}
