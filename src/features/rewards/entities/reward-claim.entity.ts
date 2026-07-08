import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Unique,
} from 'typeorm';
import { Player } from '../../players/entities/players.entity';
import { Reward } from './rewards.entity';

@Entity('reward_claims')
@Unique('uq_player_reward_claim', ['playerId', 'rewardId'])
export class RewardClaim {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'player_id' })
    playerId: number;

    @Column({ name: 'reward_id' })
    rewardId: number;

    @CreateDateColumn({ name: 'claimed_at' })
    claimedAt: Date;

    @ManyToOne(() => Player, (player) => player.rewardClaims, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'player_id' })
    player: Player;

    @ManyToOne(() => Reward, (reward) => reward.claims, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'reward_id' })
    reward: Reward;
}
