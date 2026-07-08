import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Player } from '../../players/entities/players.entity';
import { BigintTransformer } from './wallet.entity';

@Entity('wallet_transactions')
export class WalletTransaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'player_id' })
    playerId: number;

    @Column({ name: 'transaction_type', length: 30 })
    transactionType: string;

    @Column({
        type: 'bigint',
        transformer: BigintTransformer,
    })
    amount: number;

    @Column({ name: 'reference_type', length: 30, nullable: true })
    referenceType: string;

    @Column({ name: 'reference_id', length: 100, nullable: true })
    referenceId: string;

    @Column({ type: 'text', nullable: true })
    reason: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => Player, (player) => player.transactions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'player_id' })
    player: Player;
}
