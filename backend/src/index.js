"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./api/routes"));
const db_1 = require("./db");
const monitor = __importStar(require("./solana/monitor"));
const tokenHolders_1 = require("./solana/tokenHolders");
const db_2 = __importDefault(require("./db"));
console.log('DEBUG monitor import:', monitor);
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
const TARGET_TOKEN = '9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump';
app.use(express_1.default.json());
app.use('/api', routes_1.default);
app.get('/', (req, res) => {
    res.send('TokenWise Backend is running!');
});
// Start the server immediately
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
// Run Solana/DB bootstrapping in the background
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('[Startup] Initializing database...');
        yield (0, db_1.initDb)();
        console.log('[Startup] Database initialized.');
        // 1. Fetch and store top 60 holders
        console.log('[Startup] Fetching and storing top 60 token holders...');
        const holders = yield (0, tokenHolders_1.getTopTokenHolders)(TARGET_TOKEN, 60);
        for (const h of holders) {
            if (!h.wallet_address)
                continue;
            yield db_2.default.query(`INSERT INTO wallets (wallet_address, token_balance, token_quantity)
         VALUES ($1, $2, $3)
         ON CONFLICT (wallet_address) DO UPDATE SET token_balance = $2, token_quantity = $3`, [h.wallet_address, h.token_balance, h.token_quantity]);
        }
        console.log(`[Startup] Stored ${holders.length} top holders.`);
        // 2. Backfill transactions for these wallets
        console.log('[Startup] Backfilling transactions for top holders...');
        yield monitor.backfillTransactions(holders.map(h => h.wallet_address));
        console.log('[Startup] Backfill complete.');
        // 3. Start real-time monitor for these wallets (or top 10 for rate limits)
        console.log('[Startup] Starting real-time transaction monitor...');
        yield monitor.startTransactionMonitor(holders.slice(0, 10).map(h => h.wallet_address));
        console.log('[Startup] Real-time monitor started.');
    }
    catch (err) {
        console.error('[Startup] Error during Solana/DB bootstrapping:', err);
    }
}))();
