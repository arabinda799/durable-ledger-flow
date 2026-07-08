import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
    Check,
} from 'typeorm';
import { Player } from '../../players/entities/players.entity';

export const BigintTransformer = {
    to: (value: number) => value,
    from: (value: string) => (value ? parseInt(value, 10) : 0),
};

@Entity('wallets')
@Check('chk_wallet_balance_positive', 'balance >= 0')
export class Wallet {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'player_id', unique: true })
    playerId: number;

    @Column({
        type: 'bigint',
        default: 0,
        transformer: BigintTransformer,
    })
    balance: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToOne(() => Player, (player) => player.wallet, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'player_id' })
    player: Player;
}
