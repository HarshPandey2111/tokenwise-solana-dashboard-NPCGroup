````markdown
##  🧠 TokenWise — Real-Time Wallet Intelligence on Solana

##  🔍 Project Overview

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

2. **Real‐Time Transaction Monitoring**  
   - Subscribe to on‐chain events (WebSocket / RPC logs)  
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
   - **Net Direction**: “Buy‐heavy” or “Sell‐heavy” indicator  
   - **Active Wallets**: Ranked by number of transactions  
   - **Protocol Usage**: Pie chart breakdown  
   - **Time Filter**: Select last hour / 24h / custom range  
   - **Export**: Download CSV or JSON report

5. **Historical Analysis & Mock Data**  
   - Backend API supports `fromDate` / `toDate` query params  
   - Seeder script generates realistic mock data for demo/testing

---

## 🧱 Tech Stack

| Component     | Technology                                 |
| ------------- | ------------------------------------------ |
| **Backend**   | Node.js, Express, TypeScript               |
| **Blockchain**| `@solana/web3.js`                          |
| **Database**  | PostgreSQL (with `TypeORM` / `Prisma` ORM) |
| **Frontend**  | React.js, Material UI, Chart.js            |
| **Testing**   | Jest, Supertest (API)                      |

---

## 🚀 Getting Started

### ❗ Prerequisites

- **Node.js** ≥ v16  
- **npm** ≥ v8 or **Yarn**  
- **PostgreSQL** ≥ v12  
- A working Solana RPC endpoint (public or self-hosted)  

### 1. Clone & Navigate

```bash
git clone https://github.com/<your-org>/tokenwise.git
cd tokenwise
````

### 2. Configure Environment

Create `.env` in `backend/`:

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

### 3. Install Dependencies

```bash
# Backend
npm install --prefix backend

# Frontend
npm install --prefix frontend
```

### 4. Database Setup

```bash
# Ensure PostgreSQL is running
createdb tokenwise
# Run migrations (if using an ORM)
npm run migrate --prefix backend
```

### 5. Build & Start Backend

```bash
npm run build --prefix backend
npm run start --prefix backend
```

> The API will be available at `http://localhost:4000/api`

### 6. Seed Mock Data (Optional)

```bash
npx ts-node backend/src/db/seedMockData.ts
```

### 7. Start Frontend

```bash
npm run start --prefix frontend
```

> The React dashboard should open at `http://localhost:3000` (or another port if 3000 is busy)

---

## 🔧 API Endpoints

| Method | Path                         | Description                                   |
| ------ | ---------------------------- | --------------------------------------------- |
| GET    | `/api/wallets/top`           | Returns top 60 token holders                  |
| GET    | `/api/transactions/realtime` | Streams real-time transactions via SSE        |
| GET    | `/api/transactions/history`  | Query historical data by `fromDate`, `toDate` |
| GET    | `/api/transactions/export`   | Download CSV or JSON for a given range        |

---

## 🌐 Frontend Overview

* **Pages / Components**

  * `Dashboard`: Main view with charts & tables
  * `WalletTable`: Lists holders and summary stats
  * `ProtocolChart`: Pie chart for protocol usage
  * `BuySellChart`: Line or pie chart for buys vs sells
* **State Management**

  * React Context or Redux Toolkit (optional)
* **Styling**

  * Material UI with custom theming

---

## 🛠️ Troubleshooting

* **Backend fails to start**

  * Confirm `dist/index.js` exists after `npm run build`
  * Check `.env` values and DB connectivity

* **Frontend dependency errors**

  * Delete `node_modules`, then `npm install --legacy-peer-deps --prefix frontend`

* **Empty Dashboard / No Data**

  * Verify backend API returns data (`curl http://localhost:4000/api/wallets/top`)
  * Run seeder: `npx ts-node backend/src/db/seedMockData.ts`

* **Port Conflicts**

  * Change `PORT` in `.env` for backend
  * On frontend start, press `Y` to switch ports

---

## 📝 Testing

```bash
# Backend tests
npm run test --prefix backend

# Frontend tests (if any)
npm run test --prefix frontend
```

---

## 🏗️ Project Structure

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

## 📦 Deployment (Optional)

* **Containerize** with Docker
* Deploy to **Heroku**, **AWS**, or **DigitalOcean**
* Use **PM2** or **Docker Compose** for process management

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/xyz`)
3. Commit your changes (`git commit -m "Add xyz"`)
4. Push to your branch (`git push origin feature/xyz`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
