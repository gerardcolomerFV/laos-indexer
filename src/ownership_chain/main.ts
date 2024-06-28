import {TypeormDatabase} from '@subsquid/typeorm-store'
import {processor, Context} from './processor'
import * as ERC721UniversalContract from '../abi/UniversalContract'
import {getAccountKey20FromBaseUri} from './util'
import { Asset, OwnershipContract, Transfer, RawTransfer, DetectedEvents, RawOwnershipContract } from '../model'
import { v4 as uuidv4 } from 'uuid'


processor.run(new TypeormDatabase({supportHotBlocks: true, stateSchema: 'ownership_chain_processor'}), async (ctx) => {
    const ownerShipContracts = await ctx.store.find(OwnershipContract);
    let ownershipContractIds = new Set(ownerShipContracts.map(contract => contract.id));
    let detectedEvents: DetectedEvents = getDetectedEvents(ctx, ownershipContractIds)
    let rawOwnershipContracts: RawOwnershipContract[] = detectedEvents.ownershipContracts
    let rawTransfers: RawTransfer[] = detectedEvents.transfers

    // TODO init tx ****************************
    if (rawOwnershipContracts.length > 0) {
        const ownershipContractsModelArray = createOwnershipContractsModel(rawOwnershipContracts)
        await ctx.store.insert(ownershipContractsModelArray)
    }

    if (rawTransfers.length > 0) {
        // TODO improve in order to trigger only one query to DB
        let assetsDbMap: Map<string, Asset> = new Map()        
        for (let rawTransfer of rawTransfers) {
            const assetDb = await ctx.store.findOneBy(Asset, 
                {
                    ownershipContract: new OwnershipContract({id: rawTransfer.ownershipContract}),
                    tokenId: rawTransfer.tokenId
                }
            );
            if (assetDb) {
                const assetLogicalId: AssetLogicalId = {tokenId: rawTransfer.tokenId.toString().toLowerCase(), ownershipContract: rawTransfer.ownershipContract.toLowerCase()}
                assetsDbMap.set(generateAssetLogicalIdKey(assetLogicalId), assetDb)
            }
        }
        console.log(`assetsDbMap.size:`, assetsDbMap.size)

        // Create assets
        const assetsModelMap = createAssetsModelMap(rawTransfers, assetsDbMap)
        console.log(`insert ${assetsModelMap.size} Assets:`, assetsModelMap)
        await ctx.store.upsert([...assetsModelMap.values()]) 
        
        console.log(`insert ${rawTransfers.length} transfers:`, rawTransfers)
        const transfersModelArray = createTransfersModel(rawTransfers, assetsModelMap)
        await ctx.store.insert(transfersModelArray) 

        // TODO update assetTransfers[]
    }

    // TODO close tx **********************
})

interface AssetLogicalId {
    tokenId: string,
    ownershipContract: string,
}

function generateAssetLogicalIdKey(assetLogicalId: AssetLogicalId): string {
    return `${assetLogicalId.tokenId}:${assetLogicalId.ownershipContract}`;
}


function createOwnershipContractsModel(rawOwnershipContracts: RawOwnershipContract[]): OwnershipContract[] {
    let ownershipContractModel: OwnershipContract[] = []
    for (let roc of rawOwnershipContracts) {
        ownershipContractModel.push(new OwnershipContract({
            id: roc.id.toLowerCase(),
            laosContract: roc.laosContract?.toLowerCase(),
            assets: [],
        }))
    }
    return ownershipContractModel
}

function createTransfersModel(rawTransfers: RawTransfer[], assetsModalMap: Map<string, Asset>): Transfer[] {
    let transfersModel: Transfer[] = []
    for (let rt of rawTransfers) {
        transfersModel.push(new Transfer({
            id: rt.id,
            asset: assetsModalMap.get(rt.id)!,
            from: rt.from,
            to: rt.to,
            timestamp: rt.timestamp,
            blockNumber: rt.blockNumber,
            txHash: rt.txHash,
        }))
    }
    return transfersModel  
}



function createAssetsModelMap(rawTransfers: RawTransfer[], assetsDbMap: Map<string, Asset>): Map<string, Asset> {
    let assetsModelMap: Map<string, Asset> = new Map()
    let assetsToAddDbMap: Map<string, Asset> = new Map(assetsDbMap)
    for (let rt of rawTransfers) {
        // check if the asset already exists, or a new ID must be created
        let newId: string | undefined = undefined
        const assetLogicalId: AssetLogicalId = {tokenId: rt.tokenId.toString().toLowerCase(), ownershipContract: rt.ownershipContract.toLowerCase()}
        const assetLogicalIdKey = generateAssetLogicalIdKey(assetLogicalId)
        if (assetsToAddDbMap.has(assetLogicalIdKey)) {
            newId = assetsToAddDbMap.get(assetLogicalIdKey)!.id
        } else {
            newId = uuidv4()
        }
        const newAsset = new Asset({
            id: newId,
            ownershipContract: new OwnershipContract({id: rt.ownershipContract}),
            tokenId: rt.tokenId,
            owner: rt.to,
            transfers: [], // TODO add new transfer to all its transfers
        })
        assetsModelMap.set(rt.id, newAsset)        
        assetsToAddDbMap.set(assetLogicalIdKey, newAsset) // add in oder to avoid duplicates in same batch of asset upserts
    }
    return assetsModelMap
}

function getDetectedEvents(ctx: Context, ownershipContractsToCheck: Set<string> ): DetectedEvents {  
    let transfers: RawTransfer[] = []
    let ownershipContractsToInsertInDb: RawOwnershipContract[] = []
    
    for (let block of ctx.blocks) {
        for (let log of block.logs) {

          // New contract deployed?
          if (log.topics[0] === ERC721UniversalContract.events.NewERC721Universal.topic) {
            console.log('********************************************************************')
            const logDecoded = ERC721UniversalContract.events.NewERC721Universal.decode(log)                
            ownershipContractsToCheck.add(logDecoded.newContractAddress.toLowerCase()) // addresses to check transfers
            const laosContractAddress = getAccountKey20FromBaseUri(logDecoded.baseURI)
            ownershipContractsToInsertInDb.push({
                id: logDecoded.newContractAddress.toLowerCase(),
                laosContract: laosContractAddress ? laosContractAddress?.toLowerCase() : null,
            })  

            console.log('********************************************************************')
          }

          if(ownershipContractsToCheck.has(log.address.toLowerCase()) && log.topics[0] === ERC721UniversalContract.events.Transfer.topic){
            console.log('********************************************************************')
            const logDecoded = ERC721UniversalContract.events.Transfer.decode(log)
            console.log('Transfer detected:', logDecoded);

            let {from, to, tokenId} = logDecoded
            transfers.push({
                id: uuidv4(),
                tokenId,
                from,
                to,
                timestamp: new Date(block.header.timestamp),
                blockNumber: block.header.height,
                txHash: log.transactionHash,
                ownershipContract: log.address,
            })
          }          
        }
    }

    const detectedEvents: DetectedEvents = {transfers, ownershipContracts: ownershipContractsToInsertInDb}
    return detectedEvents
}
