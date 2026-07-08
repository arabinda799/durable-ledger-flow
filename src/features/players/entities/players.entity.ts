import { Column, CreateDateColumn, Entity, Index, OneToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Wallet } from "../../wallet/entities/wallet.entity";
import { WalletTransaction } from "../../wallet/entities/transactions.entity";
import { Inventory } from "../../wallet/entities/inventories.entity";
import { RewardClaim } from "../../rewards/entities/reward-claim.entity";

@Entity("players")
@Index("idx_player_uid_unique", ["playerUid"], { unique: true })
export class Player {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'player_uid', unique: true, length: 100 })
    playerUid: string;

    @Column({ name: 'name', nullable: true, length: 100 })
    name?: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToOne(() => Wallet, (wallet) => wallet.player)
    wallet: Wallet;

    @OneToMany(() => WalletTransaction, (tx) => tx.player)
    transactions: WalletTransaction[];

    @OneToMany(() => Inventory, (inventory) => inventory.player)
    inventories: Inventory[];

    @OneToMany(() => RewardClaim, (claim) => claim.player)
    rewardClaims: RewardClaim[];
}