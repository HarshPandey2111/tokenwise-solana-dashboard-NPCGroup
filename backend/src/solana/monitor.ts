import { getCachedTopWallets } from './cache';
import { getSolanaConnection } from './connection';
import pool from '../db';
import { PublicKey, ParsedInstruction, ParsedTransactionWithMeta } from '@solana/web3.js';

// Helper to identify protocol from programId (expand as needed)
function identifyProtocol(programId: string): string {
  if (programId === 'JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB') return 'Jupiter';
  if (programId === 'RVKd61ztZW9GdKzv9qQmvQhSb8PjL7WgLQN2Y2FdPaq') return 'Raydium';
  if (programId === 'orca111111111111111111111111111111111111111') return 'Orca';
  return 'Unknown';
}

export async function startTransactionMonitor(walletAddresses?: string[]) {
  const connection = getSolanaConnection();
  let wallets;
  if (walletAddresses && walletAddresses.length > 0) {
    wallets = walletAddresses.map(addr => ({ wallet_address: addr }));
  } else {
    wallets = await getCachedTopWallets(5);
  }
  for (const wallet of wallets) {
    if (!wallet.wallet_address) continue;
    const pubkey = new PublicKey(wallet.wallet_address);
    connection.onLogs(pubkey, async (logInfo) => {
      const { signature, logs, err } = logInfo;
      if (err) return;
      await new Promise(res => setTimeout(res, 300));
      const tx = await connection.getParsedTransaction(signature, { maxSupportedTransactionVersion: 0 });
      if (!tx) return;
      for (const instr of tx.transaction.message.instructions) {
        if ('parsed' in instr) {
          const parsed = instr.parsed;
          if (parsed.type === 'transfer' && parsed.info && parsed.info.mint) {
            const protocol = identifyProtocol(instr.programId.toString());
            await pool.query(
              `INSERT INTO transactions (wallet_address, tx_signature, timestamp, amount, tx_type, protocol)
               VALUES ($1, $2, to_timestamp($3), $4, $5, $6)
               ON CONFLICT DO NOTHING`,
              [
                wallet.wallet_address,
                signature,
                tx.blockTime || Math.floor(Date.now() / 1000),
                parsed.info.amount,
                parsed.info.destination === wallet.wallet_address ? 'buy' : 'sell',
                protocol
              ]
            );
          }
        }
      }
    }, 'confirmed');
  }
  console.log(`Transaction monitor started for ${wallets.length} wallets.`);
}

export async function backfillTransactions(walletAddresses?: string[]) {
  const connection = getSolanaConnection();
  let wallets;
  if (walletAddresses && walletAddresses.length > 0) {
    wallets = walletAddresses.map(addr => ({ wallet_address: addr }));
  } else {
    wallets = await getCachedTopWallets(5);
  }
  let inserted = 0;
  for (const wallet of wallets) {
    if (!wallet.wallet_address) continue;
    const pubkey = new PublicKey(wallet.wallet_address);
    const signatures = await connection.getSignaturesForAddress(pubkey, { limit: 50 });
    console.log(`[Backfill] Wallet: ${wallet.wallet_address}, Signatures fetched: ${signatures.length}`);
    for (const sigInfo of signatures) {
      const signature = sigInfo.signature;
      const tx: ParsedTransactionWithMeta | null = await connection.getParsedTransaction(signature, { maxSupportedTransactionVersion: 0 });
      if (!tx) {
        console.log(`[Backfill] Skipping signature ${signature}: No transaction found.`);
        continue;
      }
      if (!tx.transaction || !tx.transaction.message || !tx.transaction.message.instructions) {
        console.log(`[Backfill] Skipping signature ${signature}: No instructions found.`);
        continue;
      }
      let found = false;
      for (const instr of tx.transaction.message.instructions) {
        if ('parsed' in instr) {
          const parsed = instr.parsed as any;
          if (parsed.type === 'transfer' && parsed.info && parsed.info.mint) {
            found = true;
            const protocol = identifyProtocol(instr.programId.toString());
            await pool.query(
              `INSERT INTO transactions (wallet_address, tx_signature, timestamp, amount, tx_type, protocol)
               VALUES ($1, $2, to_timestamp($3), $4, $5, $6)
               ON CONFLICT DO NOTHING`,
              [
                wallet.wallet_address,
                signature,
                tx.blockTime || Math.floor(Date.now() / 1000),
                parsed.info.amount,
                parsed.info.destination === wallet.wallet_address ? 'buy' : 'sell',
                protocol
              ]
            );
            inserted++;
          }
        }
      }
      if (!found) {
        console.log(`[Backfill] Skipping signature ${signature}: No matching transfer instruction.`);
      }
    }
  }
  console.log(`Backfilled recent transactions for ${wallets.length} wallets. Inserted ${inserted} transactions.`);
} 