import pool from './index';

async function seed() {
  // Insert mock wallets
  const wallets = [
    { wallet_address: 'DemoWallet1', token_balance: 1000, token_quantity: 1000 },
    { wallet_address: 'DemoWallet2', token_balance: 500, token_quantity: 500 },
    { wallet_address: 'DemoWallet3', token_balance: 250, token_quantity: 250 },
  ];
  for (const w of wallets) {
    await pool.query(
      `INSERT INTO wallets (wallet_address, token_balance, token_quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (wallet_address) DO UPDATE SET token_balance = $2, token_quantity = $3`,
      [w.wallet_address, w.token_balance, w.token_quantity]
    );
  }

  // Insert mock transactions
  const now = new Date();
  const txs = [
    // Buys
    { wallet_address: 'DemoWallet1', tx_signature: 'sig1', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 5), amount: 100, tx_type: 'buy', protocol: 'Jupiter' },
    { wallet_address: 'DemoWallet2', tx_signature: 'sig2', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 4), amount: 50, tx_type: 'buy', protocol: 'Raydium' },
    { wallet_address: 'DemoWallet3', tx_signature: 'sig3', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 3), amount: 25, tx_type: 'buy', protocol: 'Orca' },
    // Sells
    { wallet_address: 'DemoWallet1', tx_signature: 'sig4', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 2), amount: 30, tx_type: 'sell', protocol: 'Jupiter' },
    { wallet_address: 'DemoWallet2', tx_signature: 'sig5', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 1), amount: 20, tx_type: 'sell', protocol: 'Raydium' },
    { wallet_address: 'DemoWallet3', tx_signature: 'sig6', timestamp: now, amount: 10, tx_type: 'sell', protocol: 'Orca' },
  ];
  for (const t of txs) {
    await pool.query(
      `INSERT INTO transactions (wallet_address, tx_signature, timestamp, amount, tx_type, protocol)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (tx_signature) DO NOTHING`,
      [t.wallet_address, t.tx_signature, t.timestamp, t.amount, t.tx_type, t.protocol]
    );
  }
  console.log('Mock wallets and transactions inserted.');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); }); 