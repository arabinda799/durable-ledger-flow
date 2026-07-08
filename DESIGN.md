# DESIGN.md - Durable Game Economy Service Design

This document details the architecture, technologies, data schemas, and reliability strategies of the Durable Game Economy Service.

---

## 1. Technology Choice: TypeORM vs. Prisma

For a durable, high-concurrency game economy service, **TypeORM** is selected for 

- **Explicit Concurrency Control (Pessimistic Locking)**: 
  TypeORM allows native configuration of pessimistic write locks (`SELECT ... FOR UPDATE`) within transaction blocks using `.setLock('pessimistic_write')` in its query builder. 
- **Granular Transaction Control**: 
  TypeORM provides direct access to transactions (`QueryRunner` and interactive connection managers) which is essential to guarantee all-or-nothing atomicity for wallet debits, item grants, transaction logs, and idempotency updates.
- **Native NestJS Integration**:
  `@nestjs/typeorm` provides seamless Dependency Injection (DI) integration.

---

## 2. API Contract & Additional CRUD Endpoints

All mutating endpoints require an `X-Request-ID` header to protect against network retries.

### Player APIs
- `POST /v1/players`
  - Body: `{ "playerUid": string }`
  - Response: `201 Created` with player info.

### Wallet and Transaction APIs
- `POST /v1/wallets/:playerId/credit`
  - Body: `{ "amount": number, "reason": string }`
  - Response: `201 Created` with wallet state.
- `POST /v1/wallets/:playerId/purchase`
  - Body: `{ "itemId": string, "price": number }`
  - Response: `201 Created` with inventory list.
- `GET /v1/wallets/:playerId`
  - Response: `200 OK` with `{ balance, inventory, claimedRewards }`.

### Reward Claim APIs
- `POST /v1/rewards/:rewardId/claim`
  - Body: `{ "playerId": string }`
  - Response: `201 Created` on success.

### Additional CRUD APIs
- `POST /v1/items`: Create a shop item.
  - Body: `{ "itemCode": string, "itemName": string, "price": number }`
- `GET /v1/items`: List all active shop items.
- `POST /v1/rewards`: Create a reward.
  - Body: `{ "rewardCode": string, "rewardName": string, "rewardType": string, "rewardAmount": number }`
- `GET /v1/rewards`: List all active rewards.

---

## 3. Database Schema

The service relies on PostgreSQL to enforce integrity constraints (ACID compliance):

### Schema Tables
1. **`players`**: Primary player identification.
2. **`wallets`**: Stores balance with check constraint `balance >= 0`. One-to-one with players.
3. **`items`**: Catalog of items with check constraint `price > 0`.
4. **`inventory`**: Maps players to purchased items.
5. **`rewards`**: Available rewards.
6. **`reward_claims`**: Tracks claimed rewards. Unique constraint on `(player_id, reward_id)` prevents double claims.
7. **`wallet_transactions`**: Audit trail of balance modifications.
8. **`request_collection`**: Stores `request_id`, `response` payload, `status_code`, and `expires_at` to handle client retries.

---

## 4. Concurrency & Isolation Strategy

1. **Transaction Isolation**: Using PostgreSQL default `Read Committed` level.
2. **Row Locking**: For balance updates, we issue:
   ```sql
   SELECT * FROM wallets WHERE player_id = $1 FOR UPDATE;
   ```
   This prevents concurrent requests from double-spending or overwriting updates (lost update anomaly).
3. **Atomicity**:
   Every state modification (e.g., deducting balance, adding inventory, writing transaction audits, and logging idempotency) is packaged into a single database transaction. If any step fails, the transaction rolls back completely.
