import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("players")
@Index("idx_player_uid_unique", ["playerUid"], { unique: true })
export class Player {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'player_uid', unique: true, length: 100 })
    playerUid: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}