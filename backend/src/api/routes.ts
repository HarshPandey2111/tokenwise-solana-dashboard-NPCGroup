import { Router } from 'express';
import { getCachedTopWallets } from '../solana/cache';
import pool from '../db';
import { Request, Response } from 'express';

const router = Router();

router.get('/top-wallets', async (req, res) => {
  console.log('Received request for /api/top-wallets');
  try {
    const holders = await getCachedTopWallets(60);
    res.json(holders);
  } catch (err) {
    console.error('Error in /api/top-wallets:', err);
    res.status(500).json({ error: 'Failed to fetch top wallets' });
  }
});

// --- Analytics Endpoints ---

// 1. Buys vs Sells
router.get('/insights/buys-vs-sells', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT tx_type, COUNT(*) as count FROM transactions GROUP BY tx_type`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error in /insights/buys-vs-sells:', err);
    res.status(500).json({ error: 'Failed to fetch buys vs sells' });
  }
});

// 2. Net Direction
router.get('/insights/net-direction', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT SUM(CASE WHEN tx_type = 'buy' THEN amount ELSE -amount END) as net_direction FROM transactions`
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('Error in /insights/net-direction:', err);
    res.status(500).json({ error: 'Failed to fetch net direction' });
  }
});

// 3. Wallets with Most Activity
router.get('/insights/active-wallets', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT wallet_address, COUNT(*) as tx_count FROM transactions GROUP BY wallet_address ORDER BY tx_count DESC LIMIT 10`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error in /insights/active-wallets:', err);
    res.status(500).json({ error: 'Failed to fetch active wallets' });
  }
});

// 4. Protocol Usage Breakdown
router.get('/insights/protocol-usage', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT protocol, COUNT(*) as count FROM transactions GROUP BY protocol`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error in /insights/protocol-usage:', err);
    res.status(500).json({ error: 'Failed to fetch protocol usage' });
  }
});

// 5. Transactions Over Time (with optional time filter)
router.get('/insights/transactions-over-time', async (req, res) => {
  try {
    const { from, to } = req.query;
    let query = `SELECT date_trunc('hour', timestamp) as hour, tx_type, COUNT(*) as count FROM transactions`;
    const params = [];
    if (from && to) {
      query += ` WHERE timestamp BETWEEN $1 AND $2`;
      params.push(from, to);
    }
    query += ` GROUP BY hour, tx_type ORDER BY hour ASC`;
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error in /insights/transactions-over-time:', err);
    res.status(500).json({ error: 'Failed to fetch transactions over time' });
  }
});

// 6. Export Transactions (CSV or JSON)
// router.get('/export', async (req: Request, res: Response) => {
//   try {
//     const { format = 'json', from, to } = req.query as any;
//     let query = `SELECT * FROM transactions`;
//     const params = [];
//     if (from && to) {
//       query += ` WHERE timestamp BETWEEN $1 AND $2`;
//       params.push(from, to);
//     }
//     const { rows } = await pool.query(query, params);
//     if (format === 'csv') {
//       const { Parser } = require('json2csv');
//       const parser = new Parser();
//       const csv = parser.parse(rows);
//       res.header('Content-Type', 'text/csv');
//       res.attachment('transactions.csv');
//       return res.send(csv);
//     }
//     res.json(rows);
//   } catch (err) {
//     console.error('Error in /export:', err);
//     res.status(500).json({ error: 'Failed to export transactions' });
//   }
// });

export default router;
