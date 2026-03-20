import type { Address } from 'viem';
import type { SupportedChain, ChainId } from './types';

// ═══════════════════════════════════════════════════════════════════════════════════
// CONTRACT ADDRESSES
// ═══════════════════════════════════════════════════════════════════════════════════

export const CONTRACTS = {
  base: {
    // Core cc0strategy contracts
    FACTORY: '0xDbbC0A64fFe2a23b4543b0731CF61ef0d5d4E265' as Address,
    FEE_DISTRIBUTOR: '0x498bcfdbd724989fc37259faba75168c8f47080d' as Address,
    LP_LOCKER: '0x5821e651D6fBF096dB3cBD9a21FaE4F5A1E2620A' as Address,
    HOOK: '0x5eE3602f499cFEAa4E13D27b4F7D2661906b28cC' as Address,
    MEV_MODULE: '0x9EbA427CE82A4A780871D5AB098eF5EB6c590ffd' as Address,
    
    // Extension contracts
    SIMPLE_AIRDROP: '0x30372aa1c56a145929de3b12a0a49026c9aab946' as Address,
    ETH_DEV_BUY: '0x3b11827c7280ad61ad244e955d6434af74d85980' as Address,
    
    // Uniswap V4 infrastructure
    POOL_MANAGER: '0x498581fF718922c3f8e6A244956aF099B2652b2b' as Address,
    POSITION_MANAGER: '0x7C5f5A4bBd8fD63184577525326123B519429bDc' as Address,
    UNIVERSAL_ROUTER: '0x6ff5693b99212da76ad316178a184ab56d299b43' as Address,
    PERMIT2: '0x000000000022D473030F116dDEE9F6B43aC78BA3' as Address,
    
    // Base tokens
    WETH: '0x4200000000000000000000000000000000000006' as Address,
  },
  
  ethereum: {
    // Core cc0strategy contracts
    FACTORY: '0x1dc68bc05ecb132059fb45b281dbfa92b6fab610' as Address,
    FEE_DISTRIBUTOR: '0xdcfb59f2d41c58a1325b270c2f402c1884338d0d' as Address,
    LP_LOCKER: '0x05492c0091e49374e71c93e74739d3f650b59077' as Address,
    HOOK: '0xEfd2F889eD9d7A2Bf6B6C9c2b20c5AEb6EBEe8Cc' as Address,
    MEV_MODULE: '0x47bee4a3b92caa86009e00dbeb4d43e8dcc1e955' as Address,
    
    // Extension contracts
    SIMPLE_AIRDROP: '0x5e41c22a07ba9e1ae0f3d31fcb7cd80979c9e91c' as Address,
    ETH_DEV_BUY: '0x1aae5c9dc83add5ba918524a8f02b2c65fd62bec' as Address,
    
    // Uniswap V4 infrastructure
    POOL_MANAGER: '0x000000000004444c5dc75cB358380D2e3dE08A90' as Address,
    POSITION_MANAGER: '0xbd216513d74c8cf14cf4747e6aaa6420ff64ee9e' as Address,
    UNIVERSAL_ROUTER: '0x66a9893cc07d91d95644aedd05d03f95e1dba8af' as Address,
    PERMIT2: '0x000000000022D473030F116dDEE9F6B43aC78BA3' as Address,
    
    // Ethereum tokens
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' as Address,
  },
} as const;

export const CHAIN_IDS: Record<SupportedChain, ChainId> = {
  base: 8453,
  ethereum: 1,
} as const;

// ═══════════════════════════════════════════════════════════════════════════════════
// CONTRACT ABIs
// ═══════════════════════════════════════════════════════════════════════════════════

export const FACTORY_ABI = [
  {
    name: 'deployToken',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      {
        name: 'deploymentConfig',
        type: 'tuple',
        components: [
          {
            name: 'tokenConfig',
            type: 'tuple',
            components: [
              { name: 'tokenAdmin', type: 'address' },
              { name: 'name', type: 'string' },
              { name: 'symbol', type: 'string' },
              { name: 'salt', type: 'bytes32' },
              { name: 'image', type: 'string' },
              { name: 'metadata', type: 'string' },
              { name: 'context', type: 'string' },
              { name: 'originatingChainId', type: 'uint256' },
            ],
          },
          {
            name: 'poolConfig',
            type: 'tuple',
            components: [
              { name: 'hook', type: 'address' },
              { name: 'pairedToken', type: 'address' },
              { name: 'tickIfToken0IsClanker', type: 'int24' },
              { name: 'tickSpacing', type: 'int24' },
              { name: 'poolData', type: 'bytes' },
            ],
          },
          {
            name: 'lockerConfig',
            type: 'tuple',
            components: [
              { name: 'locker', type: 'address' },
              { name: 'rewardAdmins', type: 'address[]' },
              { name: 'rewardRecipients', type: 'address[]' },
              { name: 'rewardBps', type: 'uint16[]' },
              { name: 'tickLower', type: 'int24[]' },
              { name: 'tickUpper', type: 'int24[]' },
              { name: 'positionBps', type: 'uint16[]' },
              { name: 'lockerData', type: 'bytes' },
            ],
          },
          {
            name: 'mevModuleConfig',
            type: 'tuple',
            components: [
              { name: 'mevModule', type: 'address' },
              { name: 'mevModuleData', type: 'bytes' },
            ],
          },
          {
            name: 'extensionConfigs',
            type: 'tuple[]',
            components: [
              { name: 'extension', type: 'address' },
              { name: 'msgValue', type: 'uint256' },
              { name: 'extensionBps', type: 'uint16' },
              { name: 'extensionData', type: 'bytes' },
            ],
          },
          { name: 'nftCollection', type: 'address' },
        ],
      },
    ],
    outputs: [{ name: 'token', type: 'address' }],
  },
  {
    name: 'TokenCreated',
    type: 'event',
    inputs: [
      { name: 'msgSender', type: 'address', indexed: false },
      { name: 'tokenAddress', type: 'address', indexed: true },
      { name: 'tokenAdmin', type: 'address', indexed: true },
      { name: 'tokenImage', type: 'string', indexed: false },
      { name: 'tokenName', type: 'string', indexed: false },
      { name: 'tokenSymbol', type: 'string', indexed: false },
      { name: 'tokenMetadata', type: 'string', indexed: false },
      { name: 'tokenContext', type: 'string', indexed: false },
      { name: 'startingTick', type: 'int24', indexed: false },
      { name: 'poolHook', type: 'address', indexed: false },
      { name: 'poolId', type: 'bytes32', indexed: false },
      { name: 'pairedToken', type: 'address', indexed: false },
      { name: 'locker', type: 'address', indexed: false },
      { name: 'mevModule', type: 'address', indexed: false },
      { name: 'extensionsSupply', type: 'uint256', indexed: false },
      { name: 'extensions', type: 'address[]', indexed: false },
    ],
  },
] as const;

export const FEE_DISTRIBUTOR_ABI = [
  {
    name: 'claimable',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
    outputs: [{ name: 'amount', type: 'uint256' }],
  },
  {
    name: 'claim',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'tokenIds', type: 'uint256[]' },
    ],
    outputs: [],
  },
  {
    name: 'tokenToCollection',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'token', type: 'address' }],
    outputs: [{ name: '', type: 'address' }],
  },
] as const;

export const ERC721_ABI = [
  {
    name: 'totalSupply',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'name',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'symbol',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'tokenOfOwnerByIndex',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'index', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

// ═══════════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

export function getContracts(chain: SupportedChain) {
  return CONTRACTS[chain];
}

export function getChainId(chain: SupportedChain): ChainId {
  return CHAIN_IDS[chain];
}

export function getChainFromId(chainId: number): SupportedChain | null {
  if (chainId === 8453) return 'base';
  if (chainId === 1) return 'ethereum';
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════════
// USDC ADDRESSES
// ═══════════════════════════════════════════════════════════════════════════════════

export const USDC_ADDRESSES = {
  base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address,
  ethereum: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as Address,
} as const;

// Collection listing fee
export const LISTING_FEE_USDC = 199_000_000n; // 199 USDC (6 decimals)
export const LISTING_RECIPIENT = '0x58e510F849e38095375a3e478ad1d719650B8557' as Address;

// ERC20 ABI (minimal for approve + transfer)
export const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
] as const;
