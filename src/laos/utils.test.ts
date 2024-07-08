import { generateLaosAssetUUID } from './util';



describe('generateUUID', () => {
  it('should combine tokenId and contractAddress and generate a UUID', () => {
    const tokenId = 73650113464448320614314146005078575017174739311147380597791116992882814864680n;
    const contractAddress = '0xfec1af3e023432ef364ef88653094442cfc00020';
    expect(generateLaosAssetUUID(tokenId, contractAddress)).toBe('aaaf738a-065d-56f5-8ee8-eb0ec7d2e215');
    expect(generateLaosAssetUUID(tokenId, contractAddress)).toBe('aaaf738a-065d-56f5-8ee8-eb0ec7d2e215');


  });
});