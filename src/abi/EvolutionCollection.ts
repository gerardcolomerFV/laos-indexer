import * as p from '@subsquid/evm-codec'
import { event, fun, viewFun, indexed, ContractBase } from '@subsquid/evm-abi'
import type { EventParams as EParams, FunctionArguments, FunctionReturn } from '@subsquid/evm-abi'

export const events = {
    EvolvedWithExternalURI: event("0xdde18ad2fe10c12a694de65b920c02b851c382cf63115967ea6f7098902fa1c8", "EvolvedWithExternalURI(uint256,string)", {"_tokenId": indexed(p.uint256), "_tokenURI": p.string}),
    MintedWithExternalURI: event("0xa7135052b348b0b4e9943bae82d8ef1c5ac225e594ef4271d12f0744cfc98348", "MintedWithExternalURI(address,uint96,uint256,string)", {"_to": indexed(p.address), "_slot": p.uint96, "_tokenId": p.uint256, "_tokenURI": p.string}),
    OwnershipTransferred: event("0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0", "OwnershipTransferred(address,address)", {"previousOwner": indexed(p.address), "newOwner": indexed(p.address)}),
    PublicMintingDisabled: event("0xebe230014056e5cb4ca6d8e534189bf5bfb0759489f16170654dce7c014b6699", "PublicMintingDisabled()", {}),
    PublicMintingEnabled: event("0x8ff3deee4c40ab085dd8d7d0c848cb5295e4ab5faa32e5b60e3936cf1bdc77bf", "PublicMintingEnabled()", {}),
}

export const functions = {
    owner: viewFun("0x8da5cb5b", "owner()", {}, p.address),
    tokenURI: viewFun("0xc87b56dd", "tokenURI(uint256)", {"_tokenId": p.uint256}, p.string),
    mintWithExternalURI: fun("0xfd024566", "mintWithExternalURI(address,uint96,string)", {"_to": p.address, "_slot": p.uint96, "_tokenURI": p.string}, p.uint256),
    evolveWithExternalURI: fun("0x2fd38f4d", "evolveWithExternalURI(uint256,string)", {"_tokenId": p.uint256, "_tokenURI": p.string}, ),
    transferOwnership: fun("0xf2fde38b", "transferOwnership(address)", {"newOwner": p.address}, ),
    enablePublicMinting: fun("0xf7beb98a", "enablePublicMinting()", {}, ),
    disablePublicMinting: fun("0x9190ad47", "disablePublicMinting()", {}, ),
    isPublicMintingEnabled: viewFun("0x441f06ac", "isPublicMintingEnabled()", {}, p.bool),
}

export class Contract extends ContractBase {

    owner() {
        return this.eth_call(functions.owner, {})
    }

    tokenURI(_tokenId: TokenURIParams["_tokenId"]) {
        return this.eth_call(functions.tokenURI, {_tokenId})
    }

    isPublicMintingEnabled() {
        return this.eth_call(functions.isPublicMintingEnabled, {})
    }
}

/// Event types
export type EvolvedWithExternalURIEventArgs = EParams<typeof events.EvolvedWithExternalURI>
export type MintedWithExternalURIEventArgs = EParams<typeof events.MintedWithExternalURI>
export type OwnershipTransferredEventArgs = EParams<typeof events.OwnershipTransferred>
export type PublicMintingDisabledEventArgs = EParams<typeof events.PublicMintingDisabled>
export type PublicMintingEnabledEventArgs = EParams<typeof events.PublicMintingEnabled>

/// Function types
export type OwnerParams = FunctionArguments<typeof functions.owner>
export type OwnerReturn = FunctionReturn<typeof functions.owner>

export type TokenURIParams = FunctionArguments<typeof functions.tokenURI>
export type TokenURIReturn = FunctionReturn<typeof functions.tokenURI>

export type MintWithExternalURIParams = FunctionArguments<typeof functions.mintWithExternalURI>
export type MintWithExternalURIReturn = FunctionReturn<typeof functions.mintWithExternalURI>

export type EvolveWithExternalURIParams = FunctionArguments<typeof functions.evolveWithExternalURI>
export type EvolveWithExternalURIReturn = FunctionReturn<typeof functions.evolveWithExternalURI>

export type TransferOwnershipParams = FunctionArguments<typeof functions.transferOwnership>
export type TransferOwnershipReturn = FunctionReturn<typeof functions.transferOwnership>

export type EnablePublicMintingParams = FunctionArguments<typeof functions.enablePublicMinting>
export type EnablePublicMintingReturn = FunctionReturn<typeof functions.enablePublicMinting>

export type DisablePublicMintingParams = FunctionArguments<typeof functions.disablePublicMinting>
export type DisablePublicMintingReturn = FunctionReturn<typeof functions.disablePublicMinting>

export type IsPublicMintingEnabledParams = FunctionArguments<typeof functions.isPublicMintingEnabled>
export type IsPublicMintingEnabledReturn = FunctionReturn<typeof functions.isPublicMintingEnabled>

