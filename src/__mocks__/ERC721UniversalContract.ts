export const events = {
  NewERC721Universal: {
    topic: '0x74b81bc88402765a52dad72d3d893684f472a679558f3641500e0ee14924a10a',
    decode: jest.fn().mockReturnValue({
      newContractAddress: '0xNewContractAddress',
      baseURI: 'http://base.uri',
    }),
  },
  Transfer: {
    topic: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    decode: jest.fn().mockReturnValue({
      from: '0xFromAddress',
      to: '0xToAddress',
      tokenId: BigInt(123),
    }),
  },
};