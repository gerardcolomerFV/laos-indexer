import { EntityManager } from 'typeorm';
import { TokenUri, TokenUriFetchState } from '../../model';
import { IpfsService } from './IpfsService';

export class TokenURIDataService {
  private static instance: TokenURIDataService;
  private entityManager: EntityManager;
  private ipfsService: IpfsService;
  private isUpdating: boolean = false;
  private updateQueue: (() => void) | null = null;

  private constructor(em: EntityManager) {
    this.entityManager = em;
    this.ipfsService = new IpfsService();
  }

  public static getInstance(em: EntityManager): TokenURIDataService {
    if (!TokenURIDataService.instance) {
      TokenURIDataService.instance = new TokenURIDataService(em);
    }
    return TokenURIDataService.instance;
  }

  public async updatePendingTokenUris(): Promise<void> {
    if (this.isUpdating) {
      if (!this.updateQueue) {
        return new Promise<void>((resolve) => {
          this.updateQueue = () => {
            this.updatePendingTokenUris().then(resolve);
          };
        });
      } else {
        console.log('An update is already queued.');
        return Promise.resolve();
      }
    }

    this.isUpdating = true;

    try {
      const tokenUris = await this.entityManager.find(TokenUri, { where: { state: TokenUriFetchState.Pending } });
      const updatePromises = tokenUris.map(async (tokenUri) => {
        try {
          const updatedTokenUri = await this.ipfsService.getTokenURIData(tokenUri.id);
          if (updatedTokenUri) {
            Object.assign(tokenUri, updatedTokenUri);
            tokenUri.state = TokenUriFetchState.Done;
          } else {
            console.error('Error updating token URI:', tokenUri.id);
            tokenUri.state = TokenUriFetchState.Fail;
          }
        } catch (error) {
          console.error('Error updating token URI:', tokenUri.id, error);
          tokenUri.state = TokenUriFetchState.Fail;
        }
        await this.entityManager.save(TokenUri, tokenUri);
      });

      await Promise.all(updatePromises);
    } finally {
      this.isUpdating = false;
      if (this.updateQueue) {
        const nextUpdate = this.updateQueue;
        this.updateQueue = null;
        nextUpdate();
      }
    }
  }
}
