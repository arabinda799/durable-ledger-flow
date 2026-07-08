import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    Index,
} from 'typeorm';
import { BigintTransformer } from '../../wallet/entities/wallet.entity';
import { RewardClaim } from './reward-claim.entity';

@Entity('rewards')
@Index('idx_reward_code_unique', ['rewardCode'], { unique: true })
export class Reward {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'reward_code', unique: true, length: 100 })
    rewardCode: string;

    @Column({ name: 'reward_name', length: 100 })
    rewardName: string;

    @Column({ name: 'reward_type', length: 30 })
    rewardType: string;

    @Column({
        type: 'bigint',
        name: 'reward_amount',
        transformer: BigintTransformer,
    })
    rewardAmount: number;

    @Column({ name: 'start_date', type: 'timestamp', nullable: true })
    startDate: Date;

    @Column({ name: 'end_date', type: 'timestamp', nullable: true })
    endDate: Date;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @OneToMany(() => RewardClaim, (claim) => claim.reward)
    claims: RewardClaim[];
}
