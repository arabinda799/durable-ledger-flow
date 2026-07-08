# Durable Game Economy Service

A robust, crash-durable, and exactly-once game economy backend built using NestJS and PostgreSQL (via TypeORM).

---

## Features
1. **Exactly-Once Processing**: Enforces idempotency on all mutating requests using the `X-Request-ID` header, preventing double-credits, double-debits, or double-claims under retries.
2. **Concurrency & Double-Spending Protection**: Uses pessimistic write locking (`SELECT ... FOR UPDATE`) at the database level to resolve race conditions on simultaneous transactions.
3. **Crash Durability**: Employs ACID compliant transactions guaranteeing all-or-nothing execution that survives hard kills (`kill -9`).
4. **Authoritative Economy**: Server-side validation of wallet balances, item catalog prices, and claims.
5. **Seeded Catalogs**: Database automatically seeds default player profiles, items (e.g. `sword`), and rewards (e.g. `daily_coins`) on startup.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose
- PostgreSQL (if running locally without Docker)

### Run with Docker Compose
To build and run the entire stack (PostgreSQL + NestJS Application):
```bash
docker-compose up --build
```
The application will be accessible at `http://localhost:3000`.

### Run Locally (Development)
1. Ensure PostgreSQL is running and update the `.env` file with your credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_DATABASE=game_economy
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the application in watch mode:
   ```bash
   npm run start:dev
   ```

---

## Testing

### Run Automated Tests
```bash
# Run unit tests
npm run test

# Run integration/E2E tests (Idempotency, Concurrency, and Claims)
npm run test:e2e
```

---

## API Contract

All mutating requests (`POST`, `PATCH`, `DELETE`) require a unique `X-Request-ID` header.

### 1. Credit Wallet
- **Endpoint**: `POST /v1/wallets/:playerUid/credit`
- **Body**:
  ```json
  {
    "amount": 100,
    "reason": "Quest reward"
  }
  ```
- **Response**: Uniform wrapped response containing the updated balance and inventory.

### 2. Purchase Item
- **Endpoint**: `POST /v1/wallets/:playerUid/purchase`
- **Body**:
  ```json
  {
    "itemId": "sword",
    "price": 100
  }
  ```
- **Response**: Updated balance and inventory list.

### 3. Claim Reward
- **Endpoint**: `POST /v1/rewards/:rewardCode/claim`
- **Body**:
  ```json
  {
    "playerId": "player123"
  }
  ```
- **Response**: Confirming claim and updating wallet balance.

### 4. Fetch Wallet State
- **Endpoint**: `GET /v1/wallets/:playerUid`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Success",
    "data": {
      "balance": 150,
      "inventory": ["sword"],
      "claimedRewards": ["daily_coins"]
    }
  }
  ```
