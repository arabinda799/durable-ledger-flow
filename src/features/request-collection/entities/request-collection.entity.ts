import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Player } from '../../players/entities/players.entity';

@Entity('request_collection')
@Index('idx_request_endpoint_player', ['requestId', 'endpoint', 'playerId'], { unique: true })
export class RequestCollection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'request_id', length: 255 })
  requestId: string;

  @Column({ length: 100 })
  endpoint: string;

  @Column({ name: 'player_id', type: 'int', nullable: true })
  playerId: number | null;

  @Column({ name: 'request_hash', type: 'text', nullable: true })
  requestHash: string | null;

  @Column({ type: 'jsonb', nullable: true })
  response: any | null;

  @Column({ name: 'status_code', type: 'int', nullable: true })
  statusCode: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @ManyToOne(() => Player, (player) => player.requests, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'player_id' })
  player: Player;
}
