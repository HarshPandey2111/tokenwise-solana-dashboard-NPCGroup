# 🧠 TokenWise — Real-Time Wallet Intelligence on Solana

## 🔍 Project Overview

**TokenWise** is a real-time intelligence tool designed to monitor and analyze wallet behavior for a specific token on the **Solana** blockchain. It:

- Discovers the **top 60** token holders
- Monitors their **buy/sell** transactions in real time
- Identifies which **protocol** (Jupiter, Raydium, Orca) was used
- Exposes a clean **React** dashboard with charts and tables
- Supports **historical analysis** via time filters and exports

---

## 🎯 Key Features

1. **Top Wallet Discovery**  
   - Connect via RPC to Solana  
   - Fetch the 60 largest token accounts using `getTokenLargestAccounts`  
   - Persist `wallet_address`, `token_quantity`, `balance`

2. **Real-Time Transaction Monitoring**  
   - Subscribe to on-chain events (WebSocket / RPC logs)  
   - Capture and store:  
     - `timestamp`  
     - `amount`  
     - `buy_or_sell` flag  
     - `protocol` (Jupiter | Raydium | Orca)  
     - `wallet_address`  

3. **Protocol Identification**  
   - Parse transaction metadata / program IDs  
   - Map known DEX program IDs to protocol names

4. **Insights Dashboard**  
   - **Buys vs Sells**: Pie chart & summary  
   - **Net Direction**: “Buy-heavy” or “Sell-heavy” indicator  
   - **Active Wallets**: Ranked by number of transactions  
   - **Protocol Usage**: Pie chart breakdown  
   - **Time Filter**: Select last hour / 24h / custom range  
   - **Export**: Download CSV or JSON report

5. **Historical Analysis & Mock Data**  
   - Backend API supports `fromDate` / `toDate` query params  
   - Seeder script generates realistic mock data for demo/testing

---

## 🧱 Tech Stack

| Component      | Technology                                 |
|----------------|---------------------------------------------|
| Backend        | Node.js, Express, TypeScript                |
| Blockchain     | `@solana/web3.js`                           |
| Database       | PostgreSQL (with `TypeORM` / `Prisma` ORM)  |
| Frontend       | React.js, Material UI, Chart.js             |
| Testing        | Jest, Supertest (API)                       |

---

## 🚀 Getting Started

### ❗ Prerequisites

- **Node.js** ≥ v16  
- **npm** ≥ v8 or **Yarn**  
- **PostgreSQL** ≥ v12  
- A working Solana RPC endpoint (public or self-hosted)

---

### 1. Clone & Navigate

```bash
git clone https://github.com/<your-org>/tokenwise.git
cd tokenwise
```

---

### 2. Configure Environment Variables

Create a `.env` file inside the `backend/` folder:

```env
# Solana
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# PostgreSQL
PGHOST=localhost
PGUSER=postgres
PGPASSWORD=yourpassword
PGDATABASE=tokenwise
PGPORT=5432

# App
PORT=4000
TOKEN_MINT_ADDRESS=9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump
```

---

### 3. Install Dependencies

```bash
# Backend
npm install --prefix backend

# Frontend (use --legacy-peer-deps if needed)
npm install --prefix frontend --legacy-peer-deps
```

---

### 4. Setup the Database

Make sure PostgreSQL is running and create the database:

```bash
createdb tokenwise
```

If using migrations:

```bash
npm run migrate --prefix backend
```

---

### 5. Build & Start Backend

```bash
npm run build --prefix backend
npm run start --prefix backend
```

> The backend will be available at: `http://localhost:4000`

---

### 6. Seed Mock Data (Optional for Demo)

```bash
npx ts-node backend/src/db/seedMockData.ts
```

> Ensure `.env` is properly configured before running this script.

---

### 7. Start the Frontend

```bash
npm run start --prefix frontend
```

> Opens the dashboard at `http://localhost:3000` (or another port if 3000 is occupied)

---

## 📊 Dashboard Features

- ✅ **Real-Time Charts**
  - Buy vs Sell activity
  - Protocol usage breakdown
- ✅ **Top Wallet Table**
  - Wallet addresses with balances and activity
- ✅ **Filters**
  - Filter by time range (1h, 24h, custom)
- ✅ **Exports**
  - Download `.csv` or `.json` via export API

---

## 🔌 API Endpoints

| Method | Endpoint                      | Description                                 |
|--------|-------------------------------|---------------------------------------------|
| GET    | `/api/wallets/top`            | Top 60 token holders                        |
| GET    | `/api/transactions/realtime`  | Stream real-time transactions (SSE)         |
| GET    | `/api/transactions/history`   | Query historical data by date range         |
| GET    | `/api/transactions/export`    | Export data as CSV/JSON                     |

---

## 🧪 Testing

```bash
# Run backend tests
npm run test --prefix backend
```

---

## 🗂 Project Structure

```
tokenwise/
├── backend/
│   ├── src/
│   │   ├── api/
│   │   ├── db/
│   │   ├── services/
│   │   └── index.ts
│   ├── dist/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.tsx
│   └── package.json
├── .env
└── README.md
```

---

## 🛠 Troubleshooting

| Issue                            | Solution                                                        |
|----------------------------------|-----------------------------------------------------------------|
| Backend not starting             | Run `npm run build --prefix backend` & check `.env`             |
| No data in dashboard             | Run `seedMockData.ts` to populate dummy entries                 |
| Frontend dependency conflicts    | Use `--legacy-peer-deps` with `npm install`                     |
| API proxy or CORS errors         | Ensure backend is running on `http://localhost:4000`            |
| PostgreSQL errors                | Verify credentials and DB existence                             |

---

## 📦 Deployment

You can deploy using:

- Docker (Dockerfile + Compose)
- Render / Railway / Vercel (Frontend)
- Heroku (Backend)
- PM2 for backend process management

---

## 🤝 Contributing

We welcome contributions!

```bash
git checkout -b feature/your-feature
# make your changes
git commit -m "Add feature"
git push origin feature/your-feature
```

Open a Pull Request 🚀

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

## 🔗 Resources

- [Solana Docs](https://docs.solana.com/)
- [Jupiter Aggregator](https://jup.ag/)
- [Solana Web3.js](https://github.com/solana-labs/solana-web3.js)

---

**✨ Built for showcasing blockchain intelligence. Let your dashboard do the talking.**
