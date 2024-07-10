import { createHash } from 'crypto';
import { v5 as uuidv5, v4 } from 'uuid';

export function generateAssetUUID(tokenId: bigint, contractAddress: string): string {
    const combinedString = tokenId + contractAddress;
    const hash = createHash('sha256').update(combinedString).digest('hex');
    // Use the hash as the name for a namespace-based UUID (UUID v5)
    const namespace = 'c80dfd13-4025-4b97-ac1b-cde3aca8cf31';
    const uuid = uuidv5(hash, namespace);
    return uuid;
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

export const parseBaseURI = (baseUri: string) => {
    const tokens = getBaseURITokens(baseUri);
    if (!tokens) {
      return null
    }

    //TODO get from envVar    
    const laosGlobalConsensus = 'GlobalConsensus(0:0x4756c4042a431ad2bbe61d8c4b966c1328e7a8daa0110e9bbd3d4013138a0bd4)'    
    const laosParachain = 'Parachain(2000)'
    const laosPalletInstance = 'PalletInstance(0)'
    if (tokens.length < 3 || tokens[0] !== laosGlobalConsensus || tokens[1] !== laosParachain || tokens[2] !== laosPalletInstance) {
      console.error(
        `Invalid baseURI: ${baseUri}`
      )
      return null
    }
  
    const accountKey20 = getAccountKey20(tokens[3]);
    let generalKey: string | null = null;
    if (tokens.length > 4 && tokens[4] !== '') {
      generalKey = getGeneralKey(tokens[4])
    }
  
    const ulocPrefix = tokens[0] + '/' + tokens[1] + '/' + tokens[2] + '/'
  
    return {
      globalConsensus: tokens[0],
      parachain: tokens[1],
      palletInstance: tokens[2],
      accountKey20: accountKey20,
      generalKey: generalKey,
      ulocPrefix: ulocPrefix,
    }
  }
  
  function getAccountKey20(str: string) {
    const prefix = 'AccountKey20('
    if (!str.startsWith(prefix) || !str.endsWith(')')) {
      console.error("AccountKey parameter is not correct: 'AccountKey20(' contractAddress ')'.")
      return null
    }
  
    const data = str.substring(prefix.length, str.length - 1)
    return data
  }
  
  function getGeneralKey(str: string) {
    const prefix = 'GeneralKey('
    if (!str.startsWith(prefix) || !str.endsWith(')')) {
      console.error("GeneralKey parameter is not correct: 'GeneralKey(' tokenId ')'.")
      return null
    }
  
    const data = str.substring(prefix.length, str.length - 1)
    return data
  }

export const getBaseURITokens = (baseUri: string) => {
    if (!baseUri) {
      return null
    }
    let prefix = 'https://uloc.io/';
    if (!baseUri.startsWith(prefix)) {
      prefix = 'uloc://'
      if (!baseUri.startsWith(prefix)) {
        console.warn(
          "BaseURI error format. It should start with 'https://uloc.io/' or 'uloc://'.",
          baseUri
        )
        return null;
      }
    }
  
    const str = baseUri.substring(prefix.length)
    const tokens = str.split('/')
    // Check if the baseURI ends with / or not but have at least 3 parameters
    if (tokens.length < 4) {
      console.error(
        `Invalid baseURI: ${baseUri}`
      )
      return null
    }
  
    return tokens
  }