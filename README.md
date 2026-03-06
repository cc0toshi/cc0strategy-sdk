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
  image: 'ipfs://...',
  airdrop: { enabled: true, bps: 100 }, // 1% airdrop
  devBuy: { ethAmount: '0.01' }, // Initial buy
});

console.log('Token deployed:', result.tokenAddress);
```

## Features

- **Multi-chain support**: Base (8453) and Ethereum (1)
- **wagmi compatible**: Works with viem WalletClient
- **TypeScript**: Full type exports
- **Extensions**: SimpleAirdrop and EthDevBuy support
- **Salt Mining**: Automatic on Base for correct pool ordering

## API Reference

### CC0Strategy Class

#### Constructor

```typescript
const sdk = new CC0Strategy({
  chain: 'base' | 'ethereum',
  walletClient: WalletClient,
  publicClient?: PublicClient, // Optional, created automatically
  indexerUrl?: string, // Custom indexer URL
});
```

#### deployToken()

Deploy a new token linked to an NFT collection.

```typescript
const result = await sdk.deployToken({
  name: string,
  symbol: string,
  nftCollection: Address,
  image: string, // IPFS URL recommended
  description?: string,
  airdrop?: {
    enabled: boolean,
    bps?: number, // Default: 100 (1%)
    recipient?: Address, // Default: deployer
  },
  devBuy?: {
    ethAmount: string, // ETH to buy tokens with
    minTokensOut?: bigint, // Slippage protection
    recipient?: Address, // Default: deployer
  },
  salt?: Hex, // Custom salt (auto-mined on Base)
}, onMiningProgress?: (progress: SaltMiningProgress) => void);

// Returns:
{
  tokenAddress: Address,
  poolId: Hash,
  txHash: Hash,
  blockNumber: bigint,
}
```

#### getCollections()

Fetch available NFT collections.

```typescript
const collections = await sdk.getCollections();
// Returns: Collection[]
```

#### getTokensByCollection()

Get tokens deployed for a specific NFT collection.

```typescript
const tokens = await sdk.getTokensByCollection('0x...');
// Returns: Token[]
```

#### getClaimableRewards()

Check claimable WETH rewards for NFT holders.

```typescript
const rewards = await sdk.getClaimableRewards(
  tokenAddress,
  ['1', '2', '3'] // NFT token IDs
);
// Returns: ClaimableRewards[]
```

#### claimRewards()

Claim WETH rewards for owned NFTs.

```typescript
const result = await sdk.claimRewards(
  tokenAddress,
  ['1', '2', '3'] // NFT token IDs
);
// Returns: ClaimRewardsResult
```

#### checkNFTOwnership()

Check if a wallet owns NFTs from a collection.

```typescript
const { owns, balance } = await sdk.checkNFTOwnership(nftCollection);
```

## Wagmi Integration

```typescript
import { CC0Strategy } from 'cc0strategy-sdk';
import { useWalletClient } from 'wagmi';

function DeployButton() {
  const { data: walletClient } = useWalletClient();
  
  const handleDeploy = async () => {
    if (!walletClient) return;
    
    const sdk = new CC0Strategy({
      chain: 'base',
      walletClient,
    });
    
    const result = await sdk.deployToken({
      name: 'My Token',
      symbol: 'MTK',
      nftCollection: '0x...',
      image: 'ipfs://...',
    });
    
    console.log('Deployed:', result.tokenAddress);
  };
  
  return <button onClick={handleDeploy}>Deploy Token</button>;
}
```

## Salt Mining (Base)

On Base, the SDK automatically mines a salt to ensure the token address is less than WETH. This is required for correct Uniswap V4 pool ordering.

```typescript
const result = await sdk.deployToken(
  { /* params */ },
  (progress) => {
    console.log(`Mining: ${progress.checked} salts checked (${progress.elapsed}ms)`);
  }
);
```

## Contract Addresses

### Base (8453)
- Factory: `0xDbbC0A64fFe2a23b4543b0731CF61ef0d5d4E265`
- FeeDistributor: `0x498bcfdbd724989fc37259faba75168c8f47080d`
- Hook: `0x5eE3602f499cFEAa4E13D27b4F7D2661906b28cC`
- SimpleAirdrop: `0x30372aa1c56a145929de3b12a0a49026c9aab946`
- EthDevBuy: `0x3b11827c7280ad61ad244e955d6434af74d85980`

### Ethereum (1)
- Factory: `0x1dc68bc05ecb132059fb45b281dbfa92b6fab610`
- FeeDistributor: `0xdcfb59f2d41c58a1325b270c2f402c1884338d0d`
- Hook: `0xEfd2F889eD9d7A2Bf6B6C9c2b20c5AEb6EBEe8Cc`
- SimpleAirdrop: `0x5e41c22a07ba9e1ae0f3d31fcb7cd80979c9e91c`
- EthDevBuy: `0x1aae5c9dc83add5ba918524a8f02b2c65fd62bec`

## Types

```typescript
import type {
  CC0StrategyConfig,
  SupportedChain,
  DeployTokenParams,
  DeployTokenResult,
  AirdropConfig,
  DevBuyConfig,
  Collection,
  Token,
  ClaimableRewards,
  SaltMiningProgress,
} from 'cc0strategy-sdk';
```

## License

MIT
