import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reward } from './entities/rewards.entity';
import { RewardClaim } from './entities/reward-claim.entity';
import { Player } from '../players/entities/players.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { WalletTransaction } from '../wallet/entities/transactions.entity';
import { RewardsService } from './rewards.service';
import { RewardsController } from './rewards.controller';
import { PlayersModule } from '../players/players.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reward, RewardClaim, Player, Wallet, WalletTransaction]),
    PlayersModule,
  ],
  providers: [RewardsService],
  controllers: [RewardsController],
  exports: [RewardsService, TypeOrmModule],
})
export class RewardsModule {}
