import express from 'express';
import dotenv from 'dotenv';
import routes from './api/routes';
import { initDb } from './db';
import * as monitor from './solana/monitor';
import { getTopTokenHolders } from './solana/tokenHolders';
import pool from './db';

console.log('DEBUG monitor import:', monitor);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const TARGET_TOKEN = '9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump';

app.use(express.json());
app.use('/api', routes);

app.get('/', (req, res) => {
  res.send('TokenWise Backend is running!');
});

// Start the server immediately
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Run Solana/DB bootstrapping in the background
(async () => {
  try {
    console.log('[Startup] Initializing database...');
    await initDb();
    console.log('[Startup] Database initialized.');
    // 1. Fetch and store top 60 holders
    console.log('[Startup] Fetching and storing top 60 token holders...');
    const holders = await getTopTokenHolders(TARGET_TOKEN, 60);
    for (const h of holders) {
      if (!h.wallet_address) continue;
      await pool.query(
        `INSERT INTO wallets (wallet_address, token_balance, token_quantity)
         VALUES ($1, $2, $3)
         ON CONFLICT (wallet_address) DO UPDATE SET token_balance = $2, token_quantity = $3`,
        [h.wallet_address, h.token_balance, h.token_quantity]
      );
    }
    console.log(`[Startup] Stored ${holders.length} top holders.`);
    // 2. Backfill transactions for these wallets
    console.log('[Startup] Backfilling transactions for top holders...');
    await monitor.backfillTransactions(holders.map(h => h.wallet_address));
    console.log('[Startup] Backfill complete.');
    // 3. Start real-time monitor for these wallets (or top 10 for rate limits)
    console.log('[Startup] Starting real-time transaction monitor...');
    await monitor.startTransactionMonitor(holders.slice(0, 10).map(h => h.wallet_address));
    console.log('[Startup] Real-time monitor started.');
  } catch (err) {
    console.error('[Startup] Error during Solana/DB bootstrapping:', err);
  }
})();
