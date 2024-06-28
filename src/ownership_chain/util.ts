import { createHash } from 'crypto';
import { v5 as uuidv5, v4 } from 'uuid';

export function generateUUID(tokenId: string, contractAddress: string): string {
    // Combine the tokenId and contractAddress into a single string
    const combinedString = tokenId + contractAddress;
    // Create a SHA-256 hash of the combined string
    const hash = createHash('sha256').update(combinedString).digest('hex');
    // Use the hash as the name for a namespace-based UUID (UUID v5)
    const namespace = 'c80dfd13-4025-4b97-ac1b-cde3aca8cf31';
    // Generate a UUID v5 using the hash and namespace
    const uuid = uuidv5(hash, namespace);
    return uuid;
}

export function asyncSleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export function* splitIntoBatches<T>(
    list: T[],
    maxBatchSize: number
): Generator<T[]> {
    if (list.length <= maxBatchSize) {
        yield list
    } else {
        let offset = 0
        while (list.length - offset > maxBatchSize) {
            yield list.slice(offset, offset + maxBatchSize)
            offset += maxBatchSize
        }
        yield list.slice(offset)
    }
}

export function getAccountKey20FromBaseUri(baseUri: string): string | null {
    const startKeyword: string = "AccountKey20("
    const start: number = baseUri.indexOf(startKeyword)
    let accountKey20Value: string | null = null
    
    if (start !== -1) {
        const end: number = baseUri.indexOf(')', start + startKeyword.length)
        if (end !== -1) {
            accountKey20Value = baseUri.substring(start + startKeyword.length, end)
        }
    }

    return accountKey20Value
}
