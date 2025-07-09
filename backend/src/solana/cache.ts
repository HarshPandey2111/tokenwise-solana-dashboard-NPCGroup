import { getTopTokenHolders } from './tokenHolders';
import pool from '../db';

const TOKEN_MINT = 'YOUR TOKENMINT TO FETCH REAL DATA ';
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

let cachedWallets: any[] = [];
let lastFetch = 0;

export async function getCachedTopWallets(limit = 60) {
  const now = Date.now();
  if (now - lastFetch > CACHE_DURATION_MS || cachedWallets.length === 0) {
    // Fetch from Solana and update DB/cache
    const holders = await getTopTokenHolders(TOKEN_MINT, limit);
    cachedWallets = holders;
    lastFetch = now;
    // Update DB
    for (const holder of holders) {
      await pool.query(
        `INSERT INTO wallets (wallet_address, token_balance, token_quantity)
         VALUES ($1, $2, $3)
         ON CONFLICT (wallet_address) DO UPDATE SET token_balance = $2, token_quantity = $3`,
        [holder.wallet_address, holder.token_balance, holder.token_quantity]
      );
    }
  }
  return cachedWallets;
} 
