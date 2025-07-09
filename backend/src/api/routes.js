"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cache_1 = require("../solana/cache");
const db_1 = __importDefault(require("../db"));
const router = (0, express_1.Router)();
router.get('/top-wallets', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Received request for /api/top-wallets');
    try {
        const holders = yield (0, cache_1.getCachedTopWallets)(60);
        res.json(holders);
    }
    catch (err) {
        console.error('Error in /api/top-wallets:', err);
        res.status(500).json({ error: 'Failed to fetch top wallets' });
    }
}));
// --- Analytics Endpoints ---
// 1. Buys vs Sells
router.get('/insights/buys-vs-sells', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rows } = yield db_1.default.query(`SELECT tx_type, COUNT(*) as count FROM transactions GROUP BY tx_type`);
        res.json(rows);
    }
    catch (err) {
        console.error('Error in /insights/buys-vs-sells:', err);
        res.status(500).json({ error: 'Failed to fetch buys vs sells' });
    }
}));
// 2. Net Direction
router.get('/insights/net-direction', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rows } = yield db_1.default.query(`SELECT SUM(CASE WHEN tx_type = 'buy' THEN amount ELSE -amount END) as net_direction FROM transactions`);
        res.json(rows[0]);
    }
    catch (err) {
        console.error('Error in /insights/net-direction:', err);
        res.status(500).json({ error: 'Failed to fetch net direction' });
    }
}));
// 3. Wallets with Most Activity
router.get('/insights/active-wallets', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rows } = yield db_1.default.query(`SELECT wallet_address, COUNT(*) as tx_count FROM transactions GROUP BY wallet_address ORDER BY tx_count DESC LIMIT 10`);
        res.json(rows);
    }
    catch (err) {
        console.error('Error in /insights/active-wallets:', err);
        res.status(500).json({ error: 'Failed to fetch active wallets' });
    }
}));
// 4. Protocol Usage Breakdown
router.get('/insights/protocol-usage', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rows } = yield db_1.default.query(`SELECT protocol, COUNT(*) as count FROM transactions GROUP BY protocol`);
        res.json(rows);
    }
    catch (err) {
        console.error('Error in /insights/protocol-usage:', err);
        res.status(500).json({ error: 'Failed to fetch protocol usage' });
    }
}));
// 5. Transactions Over Time (with optional time filter)
router.get('/insights/transactions-over-time', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { from, to } = req.query;
        let query = `SELECT date_trunc('hour', timestamp) as hour, tx_type, COUNT(*) as count FROM transactions`;
        const params = [];
        if (from && to) {
            query += ` WHERE timestamp BETWEEN $1 AND $2`;
            params.push(from, to);
        }
        query += ` GROUP BY hour, tx_type ORDER BY hour ASC`;
        const { rows } = yield db_1.default.query(query, params);
        res.json(rows);
    }
    catch (err) {
        console.error('Error in /insights/transactions-over-time:', err);
        res.status(500).json({ error: 'Failed to fetch transactions over time' });
    }
}));
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
exports.default = router;
