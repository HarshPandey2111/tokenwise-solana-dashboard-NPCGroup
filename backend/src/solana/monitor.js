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
exports.startTransactionMonitor = startTransactionMonitor;
exports.backfillTransactions = backfillTransactions;
const cache_1 = require("./cache");
const connection_1 = require("./connection");
const db_1 = __importDefault(require("../db"));
const web3_js_1 = require("@solana/web3.js");
// Helper to identify protocol from programId (expand as needed)
function identifyProtocol(programId) {
    if (programId === 'JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB')
        return 'Jupiter';
    if (programId === 'RVKd61ztZW9GdKzv9qQmvQhSb8PjL7WgLQN2Y2FdPaq')
        return 'Raydium';
    if (programId === 'orca111111111111111111111111111111111111111')
        return 'Orca';
    return 'Unknown';
}
function startTransactionMonitor(walletAddresses) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = (0, connection_1.getSolanaConnection)();
        let wallets;
        if (walletAddresses && walletAddresses.length > 0) {
            wallets = walletAddresses.map(addr => ({ wallet_address: addr }));
        }
        else {
            wallets = yield (0, cache_1.getCachedTopWallets)(5);
        }
        for (const wallet of wallets) {
            if (!wallet.wallet_address)
                continue;
            const pubkey = new web3_js_1.PublicKey(wallet.wallet_address);
            connection.onLogs(pubkey, (logInfo) => __awaiter(this, void 0, void 0, function* () {
                const { signature, logs, err } = logInfo;
                if (err)
                    return;
                yield new Promise(res => setTimeout(res, 300));
                const tx = yield connection.getParsedTransaction(signature, { maxSupportedTransactionVersion: 0 });
                if (!tx)
                    return;
                for (const instr of tx.transaction.message.instructions) {
                    if ('parsed' in instr) {
                        const parsed = instr.parsed;
                        if (parsed.type === 'transfer' && parsed.info && parsed.info.mint) {
                            const protocol = identifyProtocol(instr.programId.toString());
                            yield db_1.default.query(`INSERT INTO transactions (wallet_address, tx_signature, timestamp, amount, tx_type, protocol)
               VALUES ($1, $2, to_timestamp($3), $4, $5, $6)
               ON CONFLICT DO NOTHING`, [
                                wallet.wallet_address,
                                signature,
                                tx.blockTime || Math.floor(Date.now() / 1000),
                                parsed.info.amount,
                                parsed.info.destination === wallet.wallet_address ? 'buy' : 'sell',
                                protocol
                            ]);
                        }
                    }
                }
            }), 'confirmed');
        }
        console.log(`Transaction monitor started for ${wallets.length} wallets.`);
    });
}
function backfillTransactions(walletAddresses) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = (0, connection_1.getSolanaConnection)();
        let wallets;
        if (walletAddresses && walletAddresses.length > 0) {
            wallets = walletAddresses.map(addr => ({ wallet_address: addr }));
        }
        else {
            wallets = yield (0, cache_1.getCachedTopWallets)(5);
        }
        let inserted = 0;
        for (const wallet of wallets) {
            if (!wallet.wallet_address)
                continue;
            const pubkey = new web3_js_1.PublicKey(wallet.wallet_address);
            const signatures = yield connection.getSignaturesForAddress(pubkey, { limit: 50 });
            console.log(`[Backfill] Wallet: ${wallet.wallet_address}, Signatures fetched: ${signatures.length}`);
            for (const sigInfo of signatures) {
                const signature = sigInfo.signature;
                const tx = yield connection.getParsedTransaction(signature, { maxSupportedTransactionVersion: 0 });
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
                        const parsed = instr.parsed;
                        if (parsed.type === 'transfer' && parsed.info && parsed.info.mint) {
                            found = true;
                            const protocol = identifyProtocol(instr.programId.toString());
                            yield db_1.default.query(`INSERT INTO transactions (wallet_address, tx_signature, timestamp, amount, tx_type, protocol)
               VALUES ($1, $2, to_timestamp($3), $4, $5, $6)
               ON CONFLICT DO NOTHING`, [
                                wallet.wallet_address,
                                signature,
                                tx.blockTime || Math.floor(Date.now() / 1000),
                                parsed.info.amount,
                                parsed.info.destination === wallet.wallet_address ? 'buy' : 'sell',
                                protocol
                            ]);
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
    });
}
