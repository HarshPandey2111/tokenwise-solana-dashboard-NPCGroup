"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSolanaConnection = getSolanaConnection;
const web3_js_1 = require("@solana/web3.js");
function getSolanaConnection() {
    const rpcUrl = process.env.SOLANA_RPC_URL || (0, web3_js_1.clusterApiUrl)('mainnet-beta');
    return new web3_js_1.Connection(rpcUrl, 'confirmed');
}
