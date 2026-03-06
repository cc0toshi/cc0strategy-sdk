// Main SDK class
export { CC0Strategy } from './sdk';

// Types
export type {
  // Config
  CC0StrategyConfig,
  SupportedChain,
  ChainId,
  
  // Deployment
  DeployTokenParams,
  DeployTokenResult,
  AirdropConfig,
  DevBuyConfig,
  
  // Salt Mining
  SaltMiningProgress,
  SaltMiningResult,
  
  // API Types
  Collection,
  Token,
  ClaimableRewards,
  ClaimRewardsResult,
  
  // Transaction
  TransactionConfig,
} from './types';

// Contract addresses and ABIs
export {
  CONTRACTS,
  CHAIN_IDS,
  FACTORY_ABI,
  FEE_DISTRIBUTOR_ABI,
  ERC721_ABI,
  getContracts,
  getChainId,
  getChainFromId,
} from './contracts';

// Salt mining utilities (for advanced usage)
export { mineSalt, computeTokenAddress } from './saltMining';
