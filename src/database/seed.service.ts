import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from '../features/players/entities/players.entity';
import { Item } from '../features/items/entities/items.entity';
import { Reward } from '../features/rewards/entities/rewards.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Player)
    private readonly playerRepo: Repository<Player>,
    @InjectRepository(Item)
    private readonly itemRepo: Repository<Item>,
    @InjectRepository(Reward)
    private readonly rewardRepo: Repository<Reward>,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Running database seeding check...');

    // 1. Seed Default Player (player123)
    let player = await this.playerRepo.findOne({ where: { playerUid: 'player123' } });
    if (!player) {
      this.logger.log('Seeding default player: player123');
      player = this.playerRepo.create({ playerUid: 'player123' });
      player = await this.playerRepo.save(player);
      this.logger.log('Default player seeded.');
    }

    // 2. Seed Default Items
    let sword = await this.itemRepo.findOne({ where: { itemCode: 'sword' } });
    if (!sword) {
      this.logger.log('Seeding default item: sword');
      sword = this.itemRepo.create({
        itemCode: 'sword',
        itemName: 'Sword',
        price: 100,
        isActive: true,
      });
      await this.itemRepo.save(sword);
      this.logger.log('Default item sword seeded.');
    }

    // 3. Seed Default Rewards
    let dailyCoins = await this.rewardRepo.findOne({ where: { rewardCode: 'daily_coins' } });
    if (!dailyCoins) {
      this.logger.log('Seeding default reward: daily_coins');
      dailyCoins = this.rewardRepo.create({
        rewardCode: 'daily_coins',
        rewardName: 'Daily Coins',
        rewardType: 'coins',
        rewardAmount: 150,
        isActive: true,
      });
      await this.rewardRepo.save(dailyCoins);
      this.logger.log('Default reward daily_coins seeded.');
    }

    this.logger.log('Database seeding check complete.');
  }
}
