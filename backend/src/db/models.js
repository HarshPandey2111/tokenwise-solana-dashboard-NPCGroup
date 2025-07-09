"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CREATE_TRANSACTIONS_TABLE = exports.CREATE_WALLETS_TABLE = void 0;
// SQL for table creation
exports.CREATE_WALLETS_TABLE = `
CREATE TABLE IF NOT EXISTS wallets (
  wallet_address VARCHAR(44) PRIMARY KEY,
  token_balance NUMERIC,
  token_quantity NUMERIC
);
`;
exports.CREATE_TRANSACTIONS_TABLE = `
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
