import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { Player } from '../src/features/players/entities/players.entity';
import { Wallet } from './../src/features/wallet/entities/wallet.entity';
import { Item } from '../src/features/items/entities/items.entity';
import { Reward } from './../src/features/rewards/entities/rewards.entity';
import { RequestCollection } from '../src/features/request-collection/entities/request-collection.entity';
import * as crypto from 'crypto';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

describe('Durable Game Economy Service (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let testPlayerUid: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('v1');
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        stopAtFirstError: true,
        whitelist: true,
        exceptionFactory: (errors) => {
          const firstError = errors[0];
          const constraintKey = Object.keys(firstError.constraints || {})[0];
          const message = firstError.constraints?.[constraintKey] || 'Validation failed';
          return new BadRequestException(message);
        },
      }),
    );

    await app.init();

    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    testPlayerUid = `player_test_${crypto.randomBytes(4).toString('hex')}`;

    // Create a fresh player and wallet for each test to keep runs independent
    await dataSource.transaction(async (manager) => {
      const player = manager.create(Player, { playerUid: testPlayerUid });
      const savedPlayer = await manager.save(player);
      const wallet = manager.create(Wallet, { playerId: savedPlayer.id, balance: 150 });
      await manager.save(wallet);
    });
  });

  describe('Deduplication & Idempotency (X-Request-ID)', () => {
    it('should reject mutating requests if X-Request-ID header is missing', async () => {
      const response = await request(app.getHttpServer())
        .post(`/v1/wallets/${testPlayerUid}/credit`)
        .send({ amount: 100, reason: 'No header test' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('X-Request-ID');
    });

    it('should return identical responses and apply change exactly-once for duplicate credits', async () => {
      const requestId = crypto.randomUUID();
      const payload = { amount: 100, reason: 'Quest completion' };

      // First Request
      const res1 = await request(app.getHttpServer())
        .post(`/v1/wallets/${testPlayerUid}/credit`)
        .set('X-Request-ID', requestId)
        .send(payload);

      expect(res1.status).toBe(201);
      expect(res1.body.data.balance).toBe(250); // 150 + 100

      // Duplicate Request
      const res2 = await request(app.getHttpServer())
        .post(`/v1/wallets/${testPlayerUid}/credit`)
        .set('X-Request-ID', requestId)
        .send(payload);

      expect(res2.status).toBe(201);
      expect(res2.body).toEqual(res1.body);

      // Verify DB balance is only credited once
      const finalCheck = await request(app.getHttpServer())
        .get(`/v1/wallets/${testPlayerUid}`);
      expect(finalCheck.body.data.balance).toBe(250);
    });
  });

  describe('Concurrency & Double-Spending Protection', () => {
    it('should allow exactly one success and reject other parallel requests when funds are insufficient for all', async () => {
      // Wallet starts with 150.
      // We will send 10 parallel purchase requests for a 'sword' (costs 100).
      // Exactly 1 must succeed. 9 must fail.
      const parallelCount = 10;
      const promises = Array.from({ length: parallelCount }).map(() =>
        request(app.getHttpServer())
          .post(`/v1/wallets/${testPlayerUid}/purchase`)
          .set('X-Request-ID', crypto.randomUUID()) // Unique request ID for each concurrent try
          .send({ itemId: 'sword', price: 100 })
      );

      const results = await Promise.all(promises);

      const successResponses = results.filter((res) => res.status === 201);
      const failedResponses = results.filter((res) => res.status === 422 || res.status === 400);

      expect(successResponses.length).toBe(1);
      expect(failedResponses.length).toBe(9);

      // Check balance is exactly 50 (150 - 100)
      const walletState = await request(app.getHttpServer())
        .get(`/v1/wallets/${testPlayerUid}`);
      expect(walletState.body.data.balance).toBe(50);
      expect(walletState.body.data.inventory).toEqual(['sword']);
    });
  });

  describe('Claim-Once Reward Validation', () => {
    it('should prevent claiming the same reward code twice', async () => {
      const rewardCode = 'daily_coins';
      const requestId1 = crypto.randomUUID();
      const requestId2 = crypto.randomUUID();

      // Claim reward first time
      const res1 = await request(app.getHttpServer())
        .post(`/v1/rewards/${rewardCode}/claim`)
        .set('X-Request-ID', requestId1)
        .send({ playerId: testPlayerUid });

      expect(res1.status).toBe(201);
      expect(res1.body.data.balance).toBe(300); // 150 + 150 daily_coins reward

      // Try to claim again
      const res2 = await request(app.getHttpServer())
        .post(`/v1/rewards/${rewardCode}/claim`)
        .set('X-Request-ID', requestId2)
        .send({ playerId: testPlayerUid });

      expect(res2.status).toBe(409); // Conflict
      expect(res2.body.message).toContain('claimed');
    });
  });
});
