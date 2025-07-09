// SQL for table creation
export const CREATE_WALLETS_TABLE = `
CREATE TABLE IF NOT EXISTS wallets (
  wallet_address VARCHAR(44) PRIMARY KEY,
  token_balance NUMERIC,
  token_quantity NUMERIC
);
`;

export const CREATE_TRANSACTIONS_TABLE = `
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(44) REFERENCES wallets(wallet_address),
  tx_signature VARCHAR(88),
  timestamp TIMESTAMP,
  amount NUMERIC,
  tx_type VARCHAR(10), -- 'buy' or 'sell'
  protocol VARCHAR(32),
  created_at TIMESTAMP DEFAULT NOW()
);
`;

export type Wallet = {
  wallet_address: string;
  token_balance: number;
  token_quantity: number;
};

export type Transaction = {
  id?: number;
  wallet_address: string;
  tx_signature: string;
  timestamp: Date;
  amount: number;
  tx_type: 'buy' | 'sell';
  protocol: string;
  created_at?: Date;
};
