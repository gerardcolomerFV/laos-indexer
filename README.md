# LAOS Indexer

The aim of this project is to create an indexer that exposes the NFTs that have been bridglessly minted in LAOS.

Using Subsquid multi-chain indexing technology, the project includes two chain indexers to expose the state of bridglessly minted NFTs in a given EVM chain.

The first indexer detects the ERC721Universal contracts and the transfers associated with them in the specified EVM chain (Ethereum, Polygon, etc.). The second indexer detects the mint and evolution events in LAOS.

A custom GraphQL API retrieves real-time information from the two independent sources of truth created by the indexers and returns the consolidated information.

## Dependencies

- Node.js
- Docker

## Current State

- Capturing `NewERC721Universal` events on a specified EVM chain and their transfer events.

## Pending

- Capture mint and evolution events in LAOS.
- Custom GraphQL queries:
    - `getTokenById`
    - `getTokensByOwner`
    - `getTokensByCollection`
    - `getTransfersByTokenId`
    - `getEvolutionsByTokenId`

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

# 4. The command above will block the terminal,
#    fetching the chain data, transforming, and storing it in the target database.
#    To start the GraphQL server, open a separate terminal and run:
sqd serve
```

A GraphiQL playground will be available at http://localhost:4350/graphql.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or new features.

## License
This project is licensed under the MIT License. 