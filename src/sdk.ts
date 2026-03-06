import {
  createPublicClient,
  http,
  encodeAbiParameters,
  parseAbiParameters,
  decodeEventLog,
  type Address,
  type Hash,
  type Hex,
  type WalletClient,
} from 'viem';
import { base, mainnet } from 'viem/chains';

import {
  FACTORY_ABI,
  FEE_DISTRIBUTOR_ABI,
  ERC721_ABI,
  getContracts,
  getChainId,
} from './contracts';

import { mineSalt, computeTokenAddress } from './saltMining';

import type {
  CC0StrategyConfig,
  SupportedChain,
  DeployTokenParams,
  DeployTokenResult,
  Collection,
  Token,
  ClaimableRewards,
  ClaimRewardsResult,
  SaltMiningProgress,
} from './types';

const DEFAULT_INDEXER_URL = 'https://indexer-production-812c.up.railway.app';

// Pool configuration constants
const TICK_LOWER = -230400;
const TICK_UPPER = 887200;
const STARTING_TICK = -230400;
const TICK_SPACING = 200;

/**
 * CC0Strategy SDK for deploying and interacting with cc0strategy tokens
 */
export class CC0Strategy {
  public readonly chain: SupportedChain;
  public readonly chainId: number;
  public readonly walletClient: WalletClient;
  // Using 'any' to avoid complex viem type compatibility issues
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public readonly publicClient: any;
  public readonly contracts: ReturnType<typeof getContracts>;
  public readonly indexerUrl: string;

  constructor(config: CC0StrategyConfig) {
    this.chain = config.chain;
    this.chainId = getChainId(config.chain);
    this.walletClient = config.walletClient;
    this.contracts = getContracts(config.chain);
    this.indexerUrl = config.indexerUrl || DEFAULT_INDEXER_URL;

    // Create or use provided public client
    this.publicClient = config.publicClient || createPublicClient({
      chain: config.chain === 'base' ? base : mainnet,
      transport: http(),
    });
  }

  /**
   * Get the connected wallet address
   */
  get address(): Address | undefined {
    return this.walletClient.account?.address;
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // TOKEN DEPLOYMENT
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Deploy a new token
   */
  async deployToken(
    params: DeployTokenParams,
    onMiningProgress?: (progress: SaltMiningProgress) => void
  ): Promise<DeployTokenResult> {
    const deployer = this.address;
    if (!deployer) {
      throw new Error('Wallet not connected');
    }

    const account = this.walletClient.account;
    if (!account) {
      throw new Error('Wallet account not available');
    }

    // Validate NFT collection
    await this.validateNFTCollection(params.nftCollection);

    // Get or mine salt
    let salt: Hex;
    if (params.salt) {
      salt = params.salt;
    } else if (this.chain === 'base') {
      // Mine salt on Base to ensure token < WETH
      const result = await mineSalt(
        this.contracts.FACTORY,
        '0x0000000000000000000000000000000000000000' as Address,
        this.contracts.WETH,
        params.name,
        params.symbol,
        params.image,
        params.description || '',
        'cc0strategy',
        BigInt(this.chainId),
        onMiningProgress
      );
      salt = result.salt;
    } else {
      // Random salt for Ethereum
      const randomBytes = new Uint8Array(32);
      crypto.getRandomValues(randomBytes);
      salt = `0x${Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('')}` as Hex;
    }

    // Build deployment config
    const deploymentConfig = this.buildDeploymentConfig(params, salt, deployer);

    // Execute deployment
    const txHash = await this.walletClient.writeContract({
      address: this.contracts.FACTORY,
      abi: FACTORY_ABI,
      functionName: 'deployToken',
      args: [deploymentConfig],
      value: 0n,
      chain: this.chain === 'base' ? base : mainnet,
      account,
    });

    // Wait for confirmation
    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    // Parse the TokenCreated event
    const tokenCreatedLog = receipt.logs.find((log: { address: string; topics: string[] }) => {
      return log.address.toLowerCase() === this.contracts.FACTORY.toLowerCase() 
        && log.topics.length >= 3;
    });

    if (!tokenCreatedLog) {
      throw new Error('TokenCreated event not found in transaction');
    }

    const tokenAddress = `0x${tokenCreatedLog.topics[1]!.slice(26)}` as Address;

    // Decode pool ID from event
    let poolId: Hash = '0x0000000000000000000000000000000000000000000000000000000000000000' as Hash;
    try {
      const decoded = decodeEventLog({
        abi: FACTORY_ABI,
        data: tokenCreatedLog.data,
        topics: tokenCreatedLog.topics,
      });
      if (decoded.args && typeof decoded.args === 'object' && 'poolId' in decoded.args) {
        poolId = decoded.args.poolId as Hash;
      }
    } catch {
      // poolId remains empty
    }

    return {
      tokenAddress,
      poolId,
      txHash,
      blockNumber: receipt.blockNumber,
    };
  }

  /**
   * Build the deployment configuration struct
   */
  private buildDeploymentConfig(
    params: DeployTokenParams,
    salt: Hex,
    deployer: Address
  ) {
    const tokenConfig = {
      tokenAdmin: '0x0000000000000000000000000000000000000000' as Address,
      name: params.name,
      symbol: params.symbol,
      salt,
      image: params.image,
      metadata: params.description || '',
      context: 'cc0strategy',
      originatingChainId: BigInt(this.chainId),
    };

    const poolData = encodeAbiParameters(
      parseAbiParameters('uint24 clankerFee, uint24 pairedFee'),
      [69000, 69000]
    );

    const poolConfig = {
      hook: this.contracts.HOOK,
      pairedToken: this.contracts.WETH,
      tickIfToken0IsClanker: STARTING_TICK,
      tickSpacing: TICK_SPACING,
      poolData,
    };

    const lockerConfig = {
      locker: this.contracts.LP_LOCKER,
      rewardAdmins: [] as Address[],
      rewardRecipients: [] as Address[],
      rewardBps: [] as number[],
      tickLower: [TICK_LOWER] as number[],
      tickUpper: [TICK_UPPER] as number[],
      positionBps: [10000] as number[],
      lockerData: '0x' as Hex,
    };

    const mevModuleConfig = {
      mevModule: this.contracts.MEV_MODULE,
      mevModuleData: '0x' as Hex,
    };

    // Build extensions
    const extensionConfigs = this.buildExtensionConfigs(params, deployer);

    return {
      tokenConfig,
      poolConfig,
      lockerConfig,
      mevModuleConfig,
      extensionConfigs,
      nftCollection: params.nftCollection,
    };
  }

  /**
   * Build extension configurations for airdrop
   */
  private buildExtensionConfigs(params: DeployTokenParams, deployer: Address) {
    const extensionConfigs: Array<{
      extension: Address;
      msgValue: bigint;
      extensionBps: number;
      extensionData: Hex;
    }> = [];

    // Airdrop extension
    if (params.airdrop?.enabled) {
      const recipient = params.airdrop.recipient || deployer;
      const bps = params.airdrop.bps || 100; // Default 1%
      
      const airdropData = encodeAbiParameters(
        parseAbiParameters('address'),
        [recipient]
      );
      
      extensionConfigs.push({
        extension: this.contracts.SIMPLE_AIRDROP,
        msgValue: 0n,
        extensionBps: bps,
        extensionData: airdropData,
      });
    }

    return extensionConfigs;
  }

  /**
   * Validate that NFT collection implements ERC721Enumerable
   */
  async validateNFTCollection(nftCollection: Address): Promise<void> {
    try {
      const supply = await this.publicClient.readContract({
        address: nftCollection,
        abi: ERC721_ABI,
        functionName: 'totalSupply',
      });

      if (supply === 0n) {
        throw new Error('NFT collection has no tokens minted');
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('no tokens')) {
        throw error;
      }
      throw new Error('NFT collection must implement ERC721Enumerable (totalSupply)');
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // API METHODS
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Get available NFT collections
   */
  async getCollections(): Promise<Collection[]> {
    const response = await fetch(`${this.indexerUrl}/collections?chainId=${this.chainId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch collections');
    }
    const data = await response.json();
    return data.collections || data || [];
  }

  /**
   * Get tokens for a specific NFT collection
   */
  async getTokensByCollection(nftCollection: Address): Promise<Token[]> {
    const response = await fetch(
      `${this.indexerUrl}/tokens?collection=${nftCollection}&chain=${this.chain}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch tokens');
    }
    const data = await response.json();
    return data.tokens || data || [];
  }

  /**
   * Get all tokens on the current chain
   */
  async getAllTokens(): Promise<Token[]> {
    const response = await fetch(`${this.indexerUrl}/tokens?chain=${this.chain}`);
    if (!response.ok) {
      throw new Error('Failed to fetch tokens');
    }
    const data = await response.json();
    return data.tokens || data || [];
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // REWARDS
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Get claimable WETH rewards for specific token IDs
   */
  async getClaimableRewards(
    tokenAddress: Address,
    tokenIds: string[]
  ): Promise<ClaimableRewards[]> {
    const results: ClaimableRewards[] = [];

    for (const tokenId of tokenIds) {
      try {
        const amount = await this.publicClient.readContract({
          address: this.contracts.FEE_DISTRIBUTOR,
          abi: FEE_DISTRIBUTOR_ABI,
          functionName: 'claimable',
          args: [tokenAddress, BigInt(tokenId)],
        });

        results.push({
          tokenId,
          amount: amount as bigint,
        });
      } catch {
        results.push({ tokenId, amount: 0n });
      }
    }

    return results;
  }

  /**
   * Claim WETH rewards for specific token IDs
   */
  async claimRewards(
    tokenAddress: Address,
    tokenIds: string[]
  ): Promise<ClaimRewardsResult> {
    const account = this.walletClient.account;
    if (!account) {
      throw new Error('Wallet not connected');
    }

    // Get claimable amounts before claiming
    const claimables = await this.getClaimableRewards(tokenAddress, tokenIds);
    const totalClaimed = claimables.reduce((sum, c) => sum + c.amount, 0n);

    const txHash = await this.walletClient.writeContract({
      address: this.contracts.FEE_DISTRIBUTOR,
      abi: FEE_DISTRIBUTOR_ABI,
      functionName: 'claim',
      args: [tokenAddress, tokenIds.map(id => BigInt(id))],
      chain: this.chain === 'base' ? base : mainnet,
      account,
    });

    // Wait for confirmation
    await this.publicClient.waitForTransactionReceipt({ hash: txHash });

    return {
      txHash,
      tokenIds,
      totalClaimed,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Predict the token address that will be deployed
   */
  predictTokenAddress(
    params: Pick<DeployTokenParams, 'name' | 'symbol' | 'image' | 'description'>,
    salt: Hex
  ): Address {
    return computeTokenAddress(
      this.contracts.FACTORY,
      '0x0000000000000000000000000000000000000000' as Address,
      salt,
      params.name,
      params.symbol,
      params.image,
      params.description || '',
      'cc0strategy',
      BigInt(this.chainId)
    );
  }

  /**
   * Check if the user owns NFTs from a collection
   */
  async checkNFTOwnership(
    nftCollection: Address,
    owner?: Address
  ): Promise<{ owns: boolean; balance: bigint }> {
    const address = owner || this.address;
    if (!address) {
      return { owns: false, balance: 0n };
    }

    try {
      const balance = await this.publicClient.readContract({
        address: nftCollection,
        abi: ERC721_ABI,
        functionName: 'balanceOf',
        args: [address],
      });

      return {
        owns: (balance as bigint) > 0n,
        balance: balance as bigint,
      };
    } catch {
      return { owns: false, balance: 0n };
    }
  }
}
