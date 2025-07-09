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
exports.getCachedTopWallets = getCachedTopWallets;
const tokenHolders_1 = require("./tokenHolders");
const db_1 = __importDefault(require("../db"));
const TOKEN_MINT = '9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump';
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
let cachedWallets = [];
let lastFetch = 0;
function getCachedTopWallets() {
    return __awaiter(this, arguments, void 0, function* (limit = 60) {
        const now = Date.now();
        if (now - lastFetch > CACHE_DURATION_MS || cachedWallets.length === 0) {
            // Fetch from Solana and update DB/cache
            const holders = yield (0, tokenHolders_1.getTopTokenHolders)(TOKEN_MINT, limit);
            cachedWallets = holders;
            lastFetch = now;
            // Update DB
            for (const holder of holders) {
                yield db_1.default.query(`INSERT INTO wallets (wallet_address, token_balance, token_quantity)
         VALUES ($1, $2, $3)
         ON CONFLICT (wallet_address) DO UPDATE SET token_balance = $2, token_quantity = $3`, [holder.wallet_address, holder.token_balance, holder.token_quantity]);
            }
        }
        return cachedWallets;
    });
}
