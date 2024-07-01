import { createHash } from 'crypto';
import { v5 as uuidv5, v4 } from 'uuid';

export function generateLaosAssetUUID(tokenId: bigint, contractAddress: string): string {
    const combinedString = tokenId + contractAddress;
    const hash = createHash('sha256').update(combinedString).digest('hex');
    // Use the hash as the name for a namespace-based UUID (UUID v5)
    const namespace = '80fa659c-305d-4a0a-a621-cbaf9f6847bd';
    const uuid = uuidv5(hash, namespace);
    return uuid;
}

export function generateLaosAssetMetadataUUID(tokenId: bigint, contractAddress: string): string {
    const combinedString = tokenId + contractAddress;
    const hash = createHash('sha256').update(combinedString).digest('hex');
    const uuid = uuidv5(hash, v4());
    return uuid;
}