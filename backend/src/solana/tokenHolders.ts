import { getSolanaConnection } from './connection';
import { PublicKey } from '@solana/web3.js';

export async function getTopTokenHolders(tokenMint: string, limit = 60) {
  try {
    const connection = getSolanaConnection();
    const mintPubkey = new PublicKey(tokenMint);
    console.log('Fetching largest accounts for mint:', tokenMint);
    const largestAccounts = await connection.getTokenLargestAccounts(mintPubkey);
    if (!largestAccounts || !largestAccounts.value) {
      console.error('No largest accounts returned for mint:', tokenMint);
      return [];
    }
    const topAccounts = largestAccounts.value.slice(0, limit);

    // Fetch account info for each holder
    const holders = await Promise.all(
      topAccounts.map(async (acc) => {
        try {
          const accountInfo = await connection.getParsedAccountInfo(acc.address);
          const owner = (accountInfo.value?.data as any)?.parsed?.info?.owner;
          return {
            wallet_address: owner,
            token_balance: parseFloat(acc.uiAmountString || '0'),
            token_quantity: Number(acc.amount),
          };
        } catch (err) {
          console.error('Error fetching account info for', acc.address.toBase58(), err);
          return {
            wallet_address: '',
            token_balance: 0,
            token_quantity: 0,
          };
        }
      })
    );
    return holders.filter(h => h.wallet_address);
  } catch (err) {
    console.error('Error in getTopTokenHolders:', err);
    throw err;
  }
}
