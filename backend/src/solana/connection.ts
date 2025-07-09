import { Connection, clusterApiUrl } from '@solana/web3.js';

export function getSolanaConnection(): Connection {
  const rpcUrl = process.env.SOLANA_RPC_URL || clusterApiUrl('mainnet-beta');
  return new Connection(rpcUrl, 'confirmed');
}
