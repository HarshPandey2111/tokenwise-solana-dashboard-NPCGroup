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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopTokenHolders = getTopTokenHolders;
const connection_1 = require("./connection");
const web3_js_1 = require("@solana/web3.js");
function getTopTokenHolders(tokenMint_1) {
    return __awaiter(this, arguments, void 0, function* (tokenMint, limit = 60) {
        try {
            const connection = (0, connection_1.getSolanaConnection)();
            const mintPubkey = new web3_js_1.PublicKey(tokenMint);
            console.log('Fetching largest accounts for mint:', tokenMint);
            const largestAccounts = yield connection.getTokenLargestAccounts(mintPubkey);
            if (!largestAccounts || !largestAccounts.value) {
                console.error('No largest accounts returned for mint:', tokenMint);
                return [];
            }
            const topAccounts = largestAccounts.value.slice(0, limit);
            // Fetch account info for each holder
            const holders = yield Promise.all(topAccounts.map((acc) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d;
                try {
                    const accountInfo = yield connection.getParsedAccountInfo(acc.address);
                    const owner = (_d = (_c = (_b = (_a = accountInfo.value) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.parsed) === null || _c === void 0 ? void 0 : _c.info) === null || _d === void 0 ? void 0 : _d.owner;
                    return {
                        wallet_address: owner,
                        token_balance: parseFloat(acc.uiAmountString || '0'),
                        token_quantity: Number(acc.amount),
                    };
                }
                catch (err) {
                    console.error('Error fetching account info for', acc.address.toBase58(), err);
                    return {
                        wallet_address: '',
                        token_balance: 0,
                        token_quantity: 0,
                    };
                }
            })));
            return holders.filter(h => h.wallet_address);
        }
        catch (err) {
            console.error('Error in getTopTokenHolders:', err);
            throw err;
        }
    });
}
