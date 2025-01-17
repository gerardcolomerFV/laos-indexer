# LAOS Indexer

The aim of this project is to create an indexer that exposes the NFTs that have been bridglessly minted in LAOS.

Using Subsquid multi-chain indexing technology, the project includes two chain indexers to expose the state of bridglessly minted NFTs in a given EVM chain.

The first indexer detects the ERC721Universal contracts and the transfers associated with them in the specified EVM chain (Ethereum, Polygon, etc.). The second indexer detects the mint and evolution events in LAOS.

A custom GraphQL API retrieves real-time information from the two independent sources of truth created by the indexers and returns the consolidated information.

## Dependencies

- Node.js
- Docker

##  GraphQL queries:
`token`: Retrieves current details about a particular NFT.
`tokenHistory`: Returns all changes associated with the NFT's metadata.
`tokens`: Lists NFTs based on the owner's address or a collection address.
`transfers`: Shows all transfer events associated with a specific NFT.

## Quickstart

Follow these steps to set up and run the LAOS Indexer:

```bash
# 0. Install @subsquid/cli (sqd command) globally
npm i -g @subsquid/cli

# 1. Install dependencies
npm ci

# 2. Clean previous processes
sqd clean:all

# 3. Build and start the processor
sqd run .


```

A GraphiQL playground will be available at http://localhost:4350/graphql.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or new features.

## License
This project is licensed under the MIT License. 