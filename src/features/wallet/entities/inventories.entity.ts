import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Player } from '../../players/entities/players.entity';
import { Item } from '../../items/entities/items.entity';

@Entity('inventory')
export class Inventory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'player_id' })
    playerId: number;

    @Column({ name: 'item_id' })
    itemId: number;

    @CreateDateColumn({ name: 'purchased_at' })
    purchasedAt: Date;

    @ManyToOne(() => Player, (player) => player.inventories, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'player_id' })
    player: Player;

    @ManyToOne(() => Item, (item) => item.inventories, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'item_id' })
    item: Item;
}
