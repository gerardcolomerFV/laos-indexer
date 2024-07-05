import { EntityManager } from 'typeorm';
import { TokenUri, TokenUriFetchState } from '../../model';
import { IpfsService } from './IpfsService';

export class TokenURIDataService {
  private static instance: TokenURIDataService;
  private entityManager: EntityManager;
  private ipfsService: IpfsService;
  private lastUpdate: Date | null = null;
  private updateIntervalMs: number;

  private constructor(em: EntityManager,  updateIntervalMs: number = 15 * 60 * 1000) {
    this.entityManager = em;
    this.updateIntervalMs = updateIntervalMs;
    this.ipfsService = new IpfsService();
  }

  public static getInstance(em: EntityManager, updateIntervalMs: number = 15 * 60 * 1000): TokenURIDataService {
    if (!TokenURIDataService.instance) {
      TokenURIDataService.instance = new TokenURIDataService(em, updateIntervalMs);
    }
    return TokenURIDataService.instance;
  }

  public async updatePendingTokenUris(): Promise<void> {
    const now = new Date();

    if (this.lastUpdate && now.getTime() - this.lastUpdate.getTime() < this.updateIntervalMs) {
      console.log('updatePendingTokenUris can only be called every 15 minutes.');
      return;
    }

    this.lastUpdate = now;
    console.log('updatePendingTokenUris ******************************************************');
    const tokenUris = await this.entityManager.find(TokenUri, { where: { fetchState: TokenUriFetchState.Pending } });
    console.log('tokenUris', tokenUris.length);
    const updatePromises = tokenUris.map(async (tokenUri) => {
      try {
        const updatedTokenUri = await this.ipfsService.getTokenURIData(tokenUri.id);
        if (updatedTokenUri) {
          Object.assign(tokenUri, updatedTokenUri);
          tokenUri.fetchState = TokenUriFetchState.Done;
        } else {
          console.error('Error updating token URI:', tokenUri.id);
          tokenUri.fetchState = TokenUriFetchState.Fail;
        }
      } catch (error) {
        console.error('Error updating token URI:', tokenUri.id, error);
        tokenUri.fetchState = TokenUriFetchState.Fail;
      }
      await this.entityManager.save(TokenUri, tokenUri);
    });

    await Promise.all(updatePromises);
  }
}
