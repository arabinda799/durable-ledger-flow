import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like } from 'typeorm';
import { Reward } from './entities/rewards.entity';
import { RewardClaim } from './entities/reward-claim.entity';
import { Player } from '../players/entities/players.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { WalletTransaction } from '../wallet/entities/transactions.entity';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { ClaimRewardDto } from './dto/claim-reward.dto';
import { PlayersService } from '../players/players.service';
import { ApiResponse } from 'src/common/interfaces/api-response.interface';

@Injectable()
export class RewardsService {
  constructor(
    private readonly playersService: PlayersService,
    @InjectRepository(Reward)
    private readonly rewardRepo: Repository<Reward>,
    private readonly dataSource: DataSource,
  ) { }

  async create(dto: CreateRewardDto): Promise<ApiResponse<any>> {
    try {
      const { rewardCode, rewardName, rewardType, rewardAmount, startDate, endDate } = dto;
      const reward = this.rewardRepo.create({ rewardCode, rewardName, rewardType, rewardAmount, startDate, endDate });
      const savedReward = await this.rewardRepo.save(reward);

      return {
        message: 'Reward added successfully',
        data: { rewardCode: savedReward.rewardCode, rewardName: savedReward.rewardName, rewardType: savedReward.rewardType, rewardAmount: savedReward.rewardAmount, startDate: savedReward.startDate, endDate: savedReward.endDate },
      };
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('Reward with this rewardCode already exists');
      }
      throw error;
    }
  }

  async update(rewardCode: string, dto: UpdateRewardDto): Promise<ApiResponse<any>> {
    const reward = await this.rewardRepo.findOne({ where: { rewardCode } });
    if (!reward) {
      throw new NotFoundException(`Reward with code ${rewardCode} not found`);
    }

    const updatedReward = await this.rewardRepo.save({
      id: reward.id,
      ...dto,
    });

    return {
      message: 'Reward updated successfully',
      data: {
        rewardCode: updatedReward.rewardCode,
        rewardName: updatedReward.rewardName,
        rewardType: updatedReward.rewardType,
        rewardAmount: updatedReward.rewardAmount,
        startDate: updatedReward.startDate,
        endDate: updatedReward.endDate,
        isActive: updatedReward.isActive,
      },
    };
  }

  async findOne(rewardCode: string): Promise<ApiResponse<any>> {
    const reward = await this.rewardRepo.findOne({ where: { rewardCode } });
    if (!reward) {
      throw new NotFoundException(`Reward with code ${rewardCode} not found`);
    }
    return {
      message: 'Success',
      data: {
        rewardCode: reward.rewardCode,
        rewardName: reward.rewardName,
        rewardType: reward.rewardType,
        rewardAmount: reward.rewardAmount,
        startDate: reward.startDate,
        endDate: reward.endDate,
        isActive: reward.isActive,
      },
    };
  }

  async findAll(q?: string): Promise<ApiResponse<any>> {
    let whereClause: any = { isActive: true };
    if (q) {
      whereClause = [
        { rewardCode: Like(`%${q}%`), isActive: true },
        { rewardName: Like(`%${q}%`), isActive: true },
      ];
    }

    const rewards = await this.rewardRepo.find({ where: whereClause });

    return {
      message: 'Rewards retrieved successfully',
      data: rewards.map((reward) => ({
        rewardCode: reward.rewardCode,
        rewardName: reward.rewardName,
        rewardType: reward.rewardType,
        rewardAmount: reward.rewardAmount,
        startDate: reward.startDate,
        endDate: reward.endDate,
        isActive: reward.isActive,
      })),
    };
  }

  async claim(rewardCode: string, dto: ClaimRewardDto): Promise<{ message: string; balance: number }> {
    const playerResult = await this.playersService.playerInitOrFind({ playerUid: dto.playerId });
    const playerId = playerResult.data.id;

    const reward = await this.rewardRepo.findOne({ where: { rewardCode } });

    if (!reward) {
      throw new NotFoundException(`Reward ${rewardCode} not found`);
    }

    if (!reward.isActive) {
      throw new BadRequestException('Reward is not active');
    }

    const now = new Date();
    if (reward.startDate && now < reward.startDate) {
      throw new BadRequestException('Reward period has not started');
    }
    if (reward.endDate && now > reward.endDate) {
      throw new BadRequestException('Reward period has expired');
    }

    const rewardId = reward.id;

    try {
      return await this.dataSource.transaction(async (manager) => {
        let wallet = await manager.findOne(Wallet, {
          where: { playerId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!wallet) {
          wallet = manager.create(Wallet, {
            playerId,
            balance: 0,
          });
          await manager.save(wallet);
        }

        wallet.balance += reward.rewardAmount;
        await manager.save(wallet);

        const claim = manager.create(RewardClaim, {
          playerId,
          rewardId,
        });
        await manager.save(claim);

        const walletTx = manager.create(WalletTransaction, {
          playerId,
          transactionType: 'claim_reward',
          amount: reward.rewardAmount,
          referenceType: 'reward',
          referenceId: reward.rewardCode,
          reason: `Claimed reward: ${reward.rewardName}`,
        });
        await manager.save(walletTx);

        return {
          message: 'Reward claimed successfully',
          balance: wallet.balance,
        };
      });
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('Reward has already been claimed by this player');
      }
      throw error;
    }
  }
}
