import { Pool } from 'pg';
import dotenv from 'dotenv';
import { CREATE_WALLETS_TABLE, CREATE_TRANSACTIONS_TABLE } from './models';

dotenv.config();

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: Number(process.env.PGPORT) || 5432,
});

export async function initDb() {
  await pool.query(CREATE_WALLETS_TABLE);
  await pool.query(CREATE_TRANSACTIONS_TABLE);
  console.log('Database tables ensured.');
}

export default pool;
