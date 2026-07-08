import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Check,
    Index,
} from 'typeorm';
import { BigintTransformer } from '../../wallets/entities/wallet.entity';

@Entity('items')
@Check('chk_item_price_positive', 'price > 0')
@Index('idx_item_code_unique', ['itemCode'], { unique: true })
export class Item {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'item_code', unique: true, length: 100 })
    itemCode: string;

    @Column({ name: 'item_name', length: 100 })
    itemName: string;

    @Column({
        type: 'bigint',
        transformer: BigintTransformer,
    })
    price: number;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;
}
