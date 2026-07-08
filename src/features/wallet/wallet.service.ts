import { Injectable, NotFoundException, BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { DataSource, Repository } from 'typeorm';
import { CreditWalletDto } from './dtos/credit-wallet.dto';
import { ApiResponse } from 'src/common/interfaces/api-response.interface';
import { PlayersService } from '../players/players.service';
import { WalletTransaction } from './entities/transactions.entity';
import { PurchaseItemDto } from './dtos/purchase-item.dto';
import { Item } from '../items/entities/items.entity';
import { Inventory } from './entities/inventories.entity';
import { RewardClaim } from '../rewards/entities/reward-claim.entity';

@Injectable()
export class WalletService {
    constructor(
        private readonly playersService: PlayersService,
        @InjectRepository(Wallet)
        private readonly walletRepo: Repository<Wallet>,
        @InjectRepository(Item)
        private readonly itemRepo: Repository<Item>,
        @InjectRepository(Inventory)
        private readonly invRepo: Repository<Inventory>,
        private readonly dataSource: DataSource,
    ) { }


    async credit(playerUid: string, dto: CreditWalletDto): Promise<ApiResponse<any>> {
        const playerResult = await this.playersService.playerInitOrFind({ playerUid });

        const result = await this.dataSource.transaction(async (manager) => {
            let wallet = await manager.findOne(Wallet, {
                where: { playerId: playerResult.data.id },
                lock: { mode: 'pessimistic_write' },
            });

            if (!wallet) {
                wallet = manager.create(Wallet, {
                    playerId: playerResult.data.id,
                    balance: 0,
                });
                await manager.save(wallet);
            }

            wallet.balance += dto.amount;
            await manager.save(wallet);

            const tx = manager.create(WalletTransaction, {
                playerId: playerResult.data.id,
                transactionType: 'credit',
                amount: dto.amount,
                reason: dto.reason,
            });
            await manager.save(tx);

            const updatedInv = await manager.find(Inventory, {
                where: { playerId: playerResult.data.id },
                relations: { item: true },
            });
            const inventoryItems = updatedInv
                .map((i) => i.item ? i.item.itemCode : null)
                .filter(Boolean);

            const claims = await manager.find(RewardClaim, {
                where: { playerId: playerResult.data.id },
                relations: { reward: true },
            });
            const claimedRewards = claims
                .map((c) => c.reward ? c.reward.rewardCode : null)
                .filter(Boolean);

            return {
                balance: wallet.balance,
                inventory: inventoryItems,
                claimedRewards,
            };
        });

        return {
            message: `${dto.amount} Credited successfully`,
            data: result,
        };
    }

    async purchase(playerUid: string, dto: PurchaseItemDto): Promise<ApiResponse<any>> {
        const playerResult = await this.playersService.playerInitOrFind({ playerUid });

        const item = await this.itemRepo.findOne({ where: { itemCode: dto.itemId, isActive: true } });
        if (!item) {
            throw new NotFoundException(`Item ${dto.itemId} not found`);
        }

        if (item.price !== dto.price) {
            throw new BadRequestException('Transaction failed');
        }

        const result = await this.dataSource.transaction(async (manager) => {
            let wallet = await manager.findOne(Wallet, {
                where: { playerId: playerResult.data.id },
                lock: { mode: 'pessimistic_write' },
            });

            if (!wallet) {
                wallet = manager.create(Wallet, {
                    playerId: playerResult.data.id,
                    balance: 0,
                });
                await manager.save(wallet);
            }

            if (wallet.balance < item.price) {
                throw new UnprocessableEntityException('Insufficient funds');
            }

            wallet.balance -= item.price;
            await manager.save(wallet);

            const inv = manager.create(Inventory, {
                playerId: playerResult.data.id,
                itemId: item.id,
            });
            await manager.save(inv);

            const tx = manager.create(WalletTransaction, {
                playerId: playerResult.data.id,
                transactionType: 'purchase',
                amount: -item.price,
                referenceType: 'item',
                referenceId: item.itemCode,
                reason: `Purchased item: ${item.itemName}`,
            });
            await manager.save(tx);

            const updatedInv = await manager.find(Inventory, {
                where: { playerId: playerResult.data.id },
                relations: { item: true },
            });
            const inventoryItems = updatedInv
                .map((i) => i.item ? i.item.itemCode : null)
                .filter(Boolean);

            const claims = await manager.find(RewardClaim, {
                where: { playerId: playerResult.data.id },
                relations: { reward: true },
            });
            const claimedRewards = claims
                .map((c) => c.reward ? c.reward.rewardCode : null)
                .filter(Boolean);

            return {
                balance: wallet.balance,
                inventory: inventoryItems,
                claimedRewards,
            };
        });

        return {
            message: `${item.itemName} purchased successfully`,
            data: result,
        };
    }

    async getWallet(playerUid: string): Promise<ApiResponse<any>> {
        const player = await this.playersService.playerInitOrFind({ playerUid });

        let wallet = await this.walletRepo.findOne({ where: { playerId: player.data.id } });
        if (!wallet) {
            wallet = this.walletRepo.create({
                playerId: player.data.id,
                balance: 0,
            });
            await this.walletRepo.save(wallet);
        }

        const inventory = await this.invRepo.find({
            where: { playerId: player.data.id },
            relations: { item: true },
        });

        const inventoryItems = inventory
            .map((i) => i.item ? i.item.itemCode : null)
            .filter(Boolean);

        const claims = await this.dataSource.getRepository(RewardClaim).find({
            where: { playerId: player.data.id },
            relations: { reward: true },
        });

        const claimedRewards = claims
            .map((c) => c.reward ? c.reward.rewardCode : null)
            .filter(Boolean);

        return {
            message: 'Success',
            data: {
                balance: wallet.balance,
                inventory: inventoryItems,
                claimedRewards,
            }
        };
    }
}

