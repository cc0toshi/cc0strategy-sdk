import type { Address, Hash, Hex, WalletClient } from 'viem';

// ═══════════════════════════════════════════════════════════════════════════════════
// CHAIN TYPES
// ═══════════════════════════════════════════════════════════════════════════════════

export type SupportedChain = 'base' | 'ethereum';

export type ChainId = 1 | 8453;

// ═══════════════════════════════════════════════════════════════════════════════════
// SDK CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

export interface CC0StrategyConfig {
  /** Chain to deploy on: 'base' (8453) or 'ethereum' (1) */
  chain: SupportedChain;
  /** Viem WalletClient (wagmi compatible) */
  walletClient: WalletClient;
  /** Optional: Viem PublicClient for read operations */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  publicClient?: any;
  /** Optional: Custom indexer API URL */
  indexerUrl?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════════
// TOKEN DEPLOYMENT
// ═══════════════════════════════════════════════════════════════════════════════════

export interface DeployTokenParams {
  /** Token name */
  name: string;
  /** Token symbol */
  symbol: string;
  /** NFT collection address that will receive fees */
  nftCollection: Address;
  /** Token image URL (preferably IPFS) */
  image: string;
  /** Optional: Token description/metadata */
  description?: string;
  /** Optional: Custom salt (will be mined if not provided on Base) */
  salt?: Hex;
}

export interface DeployTokenResult {
  /** Deployed token address */
  tokenAddress: Address;
  /** Pool ID for the Uniswap V4 pool */
  poolId: Hash;
  /** Transaction hash */
  txHash: Hash;
  /** Block number of deployment */
  blockNumber: bigint;
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SALT MINING (for Base chain)
// ═══════════════════════════════════════════════════════════════════════════════════

export interface SaltMiningProgress {
  /** Number of salts checked */
  checked: number;
  /** Current salt being checked */
  currentSalt: Hex;
  /** Elapsed time in milliseconds */
  elapsed: number;
}

export interface SaltMiningResult {
  /** The found salt */
  salt: Hex;
  /** Predicted token address */
  address: Address;
  /** Number of attempts */
  attempts: number;
  /** Elapsed time in milliseconds */
  elapsed: number;
}

// ═══════════════════════════════════════════════════════════════════════════════════
// API TYPES (from indexer)
// ═══════════════════════════════════════════════════════════════════════════════════

export interface Collection {
  id: number;
  address: Address;
  chainId: ChainId;
  name: string;
  imageUrl: string | null;
  floorPriceEth: number | null;
  tokenCount: number;
  totalRewardsEth: number;
  totalSupply: number | null;
}

export interface Token {
  address: Address;
  name: string;
  symbol: string;
  image: string;
  nftCollection: Address;
  chain: SupportedChain;
  deployer: Address;
  deployTxHash: Hash;
  poolId: Hash;
  timestamp: number;
  isVerified?: boolean;
}

export interface ClaimableRewards {
  tokenId: string;
  amount: bigint;
}

// ═══════════════════════════════════════════════════════════════════════════════════
// TRANSACTION TYPES
// ═══════════════════════════════════════════════════════════════════════════════════

export interface TransactionConfig {
  to: Address;
  data: Hex;
  value: bigint;
}

export interface ClaimRewardsResult {
  txHash: Hash;
  tokenIds: string[];
  totalClaimed: bigint;
}
