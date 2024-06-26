import * as p from '@subsquid/evm-codec'
import { event, fun, viewFun, indexed, ContractBase } from '@subsquid/evm-abi'
import type { EventParams as EParams, FunctionArguments, FunctionReturn } from '@subsquid/evm-abi'

export const events = {
    Approval: event("0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925", "Approval(address,address,uint256)", {"owner": indexed(p.address), "approved": indexed(p.address), "tokenId": indexed(p.uint256)}),
    ApprovalForAll: event("0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31", "ApprovalForAll(address,address,bool)", {"owner": indexed(p.address), "operator": indexed(p.address), "approved": p.bool}),
    LockedBaseURI: event("0x0bca4aaa33018fc07dbe996053fc5b1f6ed8fbcce1261967821bcd7d4e95cd8c", "LockedBaseURI(string)", {"baseURI": p.string}),
    NewERC721Universal: event("0x74b81bc88402765a52dad72d3d893684f472a679558f3641500e0ee14924a10a", "NewERC721Universal(address,string)", {"newContractAddress": p.address, "baseURI": p.string}),
    OwnershipTransferred: event("0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0", "OwnershipTransferred(address,address)", {"previousOwner": indexed(p.address), "newOwner": indexed(p.address)}),
    Transfer: event("0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef", "Transfer(address,address,uint256)", {"from": indexed(p.address), "to": indexed(p.address), "tokenId": indexed(p.uint256)}),
    UpdatedBaseURI: event("0xe12d4d4a70d9b5c313db41dbfde977d2932dd59c55fca4a4af5181b2397c1725", "UpdatedBaseURI(string)", {"newBaseURI": p.string}),
    UpdatedTokenIdAffixes: event("0x59de06b481abf362e010062c9251b68540649936c6b42c718d25ec2e895cbef3", "UpdatedTokenIdAffixes(string,string)", {"newPrefix": p.string, "newSuffix": p.string}),
}

export const functions = {
    ERC721UniversalVersion: viewFun("0xf43199aa", "ERC721UniversalVersion()", {}, p.uint32),
    approve: fun("0x095ea7b3", "approve(address,uint256)", {"to": p.address, "tokenId": p.uint256}, ),
    balanceOf: viewFun("0x70a08231", "balanceOf(address)", {"_owner": p.address}, p.uint256),
    baseURI: viewFun("0x6c0360eb", "baseURI()", {}, p.string),
    broadcastMint: fun("0x46d2d496", "broadcastMint(uint256)", {"tokenId": p.uint256}, ),
    broadcastMintBatch: fun("0x227a3579", "broadcastMintBatch(uint256[])", {"tokenIds": p.array(p.uint256)}, ),
    broadcastSelfTransfer: fun("0x065ab9a3", "broadcastSelfTransfer(uint256)", {"tokenId": p.uint256}, ),
    broadcastSelfTransferBatch: fun("0x39c9b305", "broadcastSelfTransferBatch(uint256[])", {"tokenIds": p.array(p.uint256)}, ),
    burn: fun("0x42966c68", "burn(uint256)", {"tokenId": p.uint256}, ),
    getApproved: viewFun("0x081812fc", "getApproved(uint256)", {"tokenId": p.uint256}, p.address),
    initOwner: viewFun("0x57854508", "initOwner(uint256)", {"tokenId": p.uint256}, p.address),
    isApprovedForAll: viewFun("0xe985e9c5", "isApprovedForAll(address,address)", {"owner": p.address, "operator": p.address}, p.bool),
    isBaseURILocked: viewFun("0x78f1fefc", "isBaseURILocked()", {}, p.bool),
    isBurned: viewFun("0xdb44fe07", "isBurned(uint256)", {"tokenId": p.uint256}, p.bool),
    lockBaseURI: fun("0x53df5c7c", "lockBaseURI()", {}, ),
    name: viewFun("0x06fdde03", "name()", {}, p.string),
    owner: viewFun("0x8da5cb5b", "owner()", {}, p.address),
    ownerOf: viewFun("0x6352211e", "ownerOf(uint256)", {"tokenId": p.uint256}, p.address),
    renounceOwnership: fun("0x715018a6", "renounceOwnership()", {}, ),
    "safeTransferFrom(address,address,uint256)": fun("0x42842e0e", "safeTransferFrom(address,address,uint256)", {"from": p.address, "to": p.address, "tokenId": p.uint256}, ),
    "safeTransferFrom(address,address,uint256,bytes)": fun("0xb88d4fde", "safeTransferFrom(address,address,uint256,bytes)", {"from": p.address, "to": p.address, "tokenId": p.uint256, "data": p.bytes}, ),
    setApprovalForAll: fun("0xa22cb465", "setApprovalForAll(address,bool)", {"operator": p.address, "approved": p.bool}, ),
    supportsInterface: viewFun("0x01ffc9a7", "supportsInterface(bytes4)", {"interfaceId": p.bytes4}, p.bool),
    symbol: viewFun("0x95d89b41", "symbol()", {}, p.string),
    tokenURI: viewFun("0xc87b56dd", "tokenURI(uint256)", {"tokenId": p.uint256}, p.string),
    transferFrom: fun("0x23b872dd", "transferFrom(address,address,uint256)", {"from": p.address, "to": p.address, "tokenId": p.uint256}, ),
    transferOwnership: fun("0xf2fde38b", "transferOwnership(address)", {"newOwner": p.address}, ),
    updateBaseURI: fun("0x931688cb", "updateBaseURI(string)", {"newBaseURI": p.string}, ),
    updateTokenIdAffixes: fun("0xf9b7981e", "updateTokenIdAffixes(string,string)", {"newPrefix": p.string, "newSuffix": p.string}, ),
    wasEverTransferred: viewFun("0xd4b89d8d", "wasEverTransferred(uint256)", {"tokenId": p.uint256}, p.bool),
}

export class Contract extends ContractBase {

    ERC721UniversalVersion() {
        return this.eth_call(functions.ERC721UniversalVersion, {})
    }

    balanceOf(_owner: BalanceOfParams["_owner"]) {
        return this.eth_call(functions.balanceOf, {_owner})
    }

    baseURI() {
        return this.eth_call(functions.baseURI, {})
    }

    getApproved(tokenId: GetApprovedParams["tokenId"]) {
        return this.eth_call(functions.getApproved, {tokenId})
    }

    initOwner(tokenId: InitOwnerParams["tokenId"]) {
        return this.eth_call(functions.initOwner, {tokenId})
    }

    isApprovedForAll(owner: IsApprovedForAllParams["owner"], operator: IsApprovedForAllParams["operator"]) {
        return this.eth_call(functions.isApprovedForAll, {owner, operator})
    }

    isBaseURILocked() {
        return this.eth_call(functions.isBaseURILocked, {})
    }

    isBurned(tokenId: IsBurnedParams["tokenId"]) {
        return this.eth_call(functions.isBurned, {tokenId})
    }

    name() {
        return this.eth_call(functions.name, {})
    }

    owner() {
        return this.eth_call(functions.owner, {})
    }

    ownerOf(tokenId: OwnerOfParams["tokenId"]) {
        return this.eth_call(functions.ownerOf, {tokenId})
    }

    supportsInterface(interfaceId: SupportsInterfaceParams["interfaceId"]) {
        return this.eth_call(functions.supportsInterface, {interfaceId})
    }

    symbol() {
        return this.eth_call(functions.symbol, {})
    }

    tokenURI(tokenId: TokenURIParams["tokenId"]) {
        return this.eth_call(functions.tokenURI, {tokenId})
    }

    wasEverTransferred(tokenId: WasEverTransferredParams["tokenId"]) {
        return this.eth_call(functions.wasEverTransferred, {tokenId})
    }
}

/// Event types
export type ApprovalEventArgs = EParams<typeof events.Approval>
export type ApprovalForAllEventArgs = EParams<typeof events.ApprovalForAll>
export type LockedBaseURIEventArgs = EParams<typeof events.LockedBaseURI>
export type NewERC721UniversalEventArgs = EParams<typeof events.NewERC721Universal>
export type OwnershipTransferredEventArgs = EParams<typeof events.OwnershipTransferred>
export type TransferEventArgs = EParams<typeof events.Transfer>
export type UpdatedBaseURIEventArgs = EParams<typeof events.UpdatedBaseURI>
export type UpdatedTokenIdAffixesEventArgs = EParams<typeof events.UpdatedTokenIdAffixes>

/// Function types
export type ERC721UniversalVersionParams = FunctionArguments<typeof functions.ERC721UniversalVersion>
export type ERC721UniversalVersionReturn = FunctionReturn<typeof functions.ERC721UniversalVersion>

export type ApproveParams = FunctionArguments<typeof functions.approve>
export type ApproveReturn = FunctionReturn<typeof functions.approve>

export type BalanceOfParams = FunctionArguments<typeof functions.balanceOf>
export type BalanceOfReturn = FunctionReturn<typeof functions.balanceOf>

export type BaseURIParams = FunctionArguments<typeof functions.baseURI>
export type BaseURIReturn = FunctionReturn<typeof functions.baseURI>

export type BroadcastMintParams = FunctionArguments<typeof functions.broadcastMint>
export type BroadcastMintReturn = FunctionReturn<typeof functions.broadcastMint>

export type BroadcastMintBatchParams = FunctionArguments<typeof functions.broadcastMintBatch>
export type BroadcastMintBatchReturn = FunctionReturn<typeof functions.broadcastMintBatch>

export type BroadcastSelfTransferParams = FunctionArguments<typeof functions.broadcastSelfTransfer>
export type BroadcastSelfTransferReturn = FunctionReturn<typeof functions.broadcastSelfTransfer>

export type BroadcastSelfTransferBatchParams = FunctionArguments<typeof functions.broadcastSelfTransferBatch>
export type BroadcastSelfTransferBatchReturn = FunctionReturn<typeof functions.broadcastSelfTransferBatch>

export type BurnParams = FunctionArguments<typeof functions.burn>
export type BurnReturn = FunctionReturn<typeof functions.burn>

export type GetApprovedParams = FunctionArguments<typeof functions.getApproved>
export type GetApprovedReturn = FunctionReturn<typeof functions.getApproved>

export type InitOwnerParams = FunctionArguments<typeof functions.initOwner>
export type InitOwnerReturn = FunctionReturn<typeof functions.initOwner>

export type IsApprovedForAllParams = FunctionArguments<typeof functions.isApprovedForAll>
export type IsApprovedForAllReturn = FunctionReturn<typeof functions.isApprovedForAll>

export type IsBaseURILockedParams = FunctionArguments<typeof functions.isBaseURILocked>
export type IsBaseURILockedReturn = FunctionReturn<typeof functions.isBaseURILocked>

export type IsBurnedParams = FunctionArguments<typeof functions.isBurned>
export type IsBurnedReturn = FunctionReturn<typeof functions.isBurned>

export type LockBaseURIParams = FunctionArguments<typeof functions.lockBaseURI>
export type LockBaseURIReturn = FunctionReturn<typeof functions.lockBaseURI>

export type NameParams = FunctionArguments<typeof functions.name>
export type NameReturn = FunctionReturn<typeof functions.name>

export type OwnerParams = FunctionArguments<typeof functions.owner>
export type OwnerReturn = FunctionReturn<typeof functions.owner>

export type OwnerOfParams = FunctionArguments<typeof functions.ownerOf>
export type OwnerOfReturn = FunctionReturn<typeof functions.ownerOf>

export type RenounceOwnershipParams = FunctionArguments<typeof functions.renounceOwnership>
export type RenounceOwnershipReturn = FunctionReturn<typeof functions.renounceOwnership>

export type SafeTransferFromParams_0 = FunctionArguments<typeof functions["safeTransferFrom(address,address,uint256)"]>
export type SafeTransferFromReturn_0 = FunctionReturn<typeof functions["safeTransferFrom(address,address,uint256)"]>

export type SafeTransferFromParams_1 = FunctionArguments<typeof functions["safeTransferFrom(address,address,uint256,bytes)"]>
export type SafeTransferFromReturn_1 = FunctionReturn<typeof functions["safeTransferFrom(address,address,uint256,bytes)"]>

export type SetApprovalForAllParams = FunctionArguments<typeof functions.setApprovalForAll>
export type SetApprovalForAllReturn = FunctionReturn<typeof functions.setApprovalForAll>

export type SupportsInterfaceParams = FunctionArguments<typeof functions.supportsInterface>
export type SupportsInterfaceReturn = FunctionReturn<typeof functions.supportsInterface>

export type SymbolParams = FunctionArguments<typeof functions.symbol>
export type SymbolReturn = FunctionReturn<typeof functions.symbol>

export type TokenURIParams = FunctionArguments<typeof functions.tokenURI>
export type TokenURIReturn = FunctionReturn<typeof functions.tokenURI>

export type TransferFromParams = FunctionArguments<typeof functions.transferFrom>
export type TransferFromReturn = FunctionReturn<typeof functions.transferFrom>

export type TransferOwnershipParams = FunctionArguments<typeof functions.transferOwnership>
export type TransferOwnershipReturn = FunctionReturn<typeof functions.transferOwnership>

export type UpdateBaseURIParams = FunctionArguments<typeof functions.updateBaseURI>
export type UpdateBaseURIReturn = FunctionReturn<typeof functions.updateBaseURI>

export type UpdateTokenIdAffixesParams = FunctionArguments<typeof functions.updateTokenIdAffixes>
export type UpdateTokenIdAffixesReturn = FunctionReturn<typeof functions.updateTokenIdAffixes>

export type WasEverTransferredParams = FunctionArguments<typeof functions.wasEverTransferred>
export type WasEverTransferredReturn = FunctionReturn<typeof functions.wasEverTransferred>

