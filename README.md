# cc0strategy-sdk

SDK for deploying cc0strategy tokens from external websites. Deploy ERC-20 tokens linked to NFT collections with trading fees flowing to NFT holders.

## Installation

```bash
npm install cc0strategy-sdk viem
```

## Quick Start

```typescript
import { CC0Strategy } from 'cc0strategy-sdk';
import { createWalletClient, custom } from 'viem';
import { base } from 'viem/chains';

// Create wallet client (wagmi compatible)
const walletClient = createWalletClient({
  chain: base,
  transport: custom(window.ethereum),
});

// Initialize SDK
const sdk = new CC0Strategy({
  chain: 'base', // or 'ethereum'
  walletClient,
});

// Deploy a token
const result = await sdk.deployToken({
  name: 'My Token',
  symbol: 'MTK',
  nftCollection: '0x5c5d3cbaf7a3419af8e6661486b2d5ec3accfb1b',
  image: 'ipfs://QmYourImageHash',
  description: 'My awesome token',
});

console.log('Token deployed:', result.tokenAddress);
```

## Features

- **Deploy Tokens** - Create new ERC-20 tokens linked to NFT collections
- **Automatic 1% Airdrop** - Deployer automatically receives 1% of token supply
- **Multi-chain** - Supports both Base and Ethereum mainnet
- **Fee Distribution** - Trading fees automatically flow to NFT holders
- **Claim Rewards** - Helper methods for claiming WETH rewards

## API Reference

### Constructor

```typescript
const sdk = new CC0Strategy({
  chain: 'base' | 'ethereum',
  walletClient: WalletClient,
  publicClient?: PublicClient, // Optional, created automatically
  indexerUrl?: string, // Optional, defaults to official indexer
});
```

### deployToken

Deploy a new token linked to an NFT collection. The deployer automatically receives 1% of the token supply.

```typescript
const result = await sdk.deployToken({
  name: string,
  symbol: string,
  nftCollection: Address,
  image: string, // IPFS URL recommended
  description?: string,
  salt?: Hex, // Optional, auto-mined on Base
});

// Returns:
{
  tokenAddress: Address,
  poolId: Hash,
  txHash: Hash,
  blockNumber: bigint,
}
```

> **Note:** Every deployment automatically includes a 1% airdrop to the deployer. This is mandatory and not configurable.

### getCollections

Fetch available NFT collections.

```typescript
const collections = await sdk.getCollections();
```

### getTokensByCollection

Get tokens deployed for a specific NFT collection.

```typescript
const tokens = await sdk.getTokensByCollection('0x...');
```

### claimRewards

Claim WETH rewards for NFT token IDs.

```typescript
const result = await sdk.claimRewards(
  tokenAddress,
  ['1', '2', '3'] // NFT token IDs
);
```

### getClaimableRewards

Check claimable WETH amounts for specific NFT token IDs.

```typescript
const rewards = await sdk.getClaimableRewards(tokenAddress, ['1', '2', '3']);
```

## Tokenomics

Every token deployed via cc0strategy has:

- **Total Supply:** 100 billion tokens
- **1% Deployer Airdrop:** Automatic, mandatory
- **0.8% Trading Fees:** Distributed to NFT holders
- **Ownership:** Renounced (fully decentralized)

## Supported Chains

| Chain | Chain ID | Factory |
|-------|----------|---------|
| Base | 8453 | `0xDbbC0A64fFe2a23b4543b0731CF61ef0d5d4E265` |
| Ethereum | 1 | `0x1dc68bc05ecb132059fb45b281dbfa92b6fab610` |

## Links

- **Website**: https://cc0strategy.fun
- **Docs**: https://cc0strategy.fun/docs
- **GitHub**: https://github.com/cc0toshi/cc0strategy-sdk

## License

MIT
