import axios from 'axios';
import { TokenUri, Attribute } from '../../model';

export class IpfsService {
  private ipfsUrlToHttpUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('ipfs://')) {
      return url.replace('ipfs://', process.env.PRIVATE_IPFS_GATEWAY || 'ipfs://');
    }
    return url;
  }

  private async fetchData(url: string): Promise<any> {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.warn('Error fetching data from URL:', url, error);
      return null;
    }
  }

  private async getDataFromIpfs(ipfsUrl: string): Promise<any> {
    const httpUrl = this.ipfsUrlToHttpUrl(ipfsUrl);
    return await this.fetchData(httpUrl);
  }

  private async getDataFromHttp(httpUrl: string): Promise<any> {
    return await this.fetchData(httpUrl);
  }

  private mapAttributes(attributes: any[]): Attribute[] | null {
    if (attributes && Array.isArray(attributes)) {
      attributes = attributes.map((attr: any) => {
        if (attr.trait_type && attr.value) {
          const attribute = new Attribute();
          (attribute as any).trait_type = attr.trait_type;
          (attribute as any).value = attr.value;
          return attribute;
        } else {
          console.warn('Invalid attribute format:', attr);
          return null;
        }
      }).filter(attr => attr !== null);
    }
    return attributes;
  }


  public async getTokenURIData(url: string): Promise<Partial<TokenUri>> {
    let data: any;
    if (url.startsWith('ipfs://')) {
      data = await this.getDataFromIpfs(url);
    } else {
      data = await this.getDataFromHttp(url);
    }

    if (!data) {
      throw new Error('Failed to fetch token URI data');
    }

    const attributes = this.mapAttributes(data.attributes);

    const tokenUri = new TokenUri({
      id: url,
      fetchState: 'done',
      name: data.name || null,
      description: data.description || null,
      image: data.image || null,
      attributes,
      fetchedAt: new Date(),
    });

    return tokenUri;
  }
}