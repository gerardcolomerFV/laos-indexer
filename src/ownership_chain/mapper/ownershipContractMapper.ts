import { RawOwnershipContract, OwnershipContract } from '../../model';


export function mapToOwnershipContract(raw: RawOwnershipContract): OwnershipContract {
  return new OwnershipContract({
    id: raw.id,
    laosContract: raw.laosContract,
    assets: [],
  });
}

export function createOwnershipContractsModel(rawOwnershipContracts: RawOwnershipContract[]): OwnershipContract[] {
  return rawOwnershipContracts.map(mapToOwnershipContract);
}
