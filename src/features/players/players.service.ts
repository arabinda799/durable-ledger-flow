import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from './entities/players.entity';
import { Repository } from 'typeorm';
import { PlayerInitDto } from './dto/player-init.dto';
import { ApiResponse } from '../../common/interfaces/api-response.interface';

@Injectable()
export class PlayersService {

    constructor(
        @InjectRepository(Player)
        private readonly playerRepo: Repository<Player>,
    ) { }


    async playerInitOrFind(dto: PlayerInitDto): Promise<ApiResponse<any>> {
        const { playerUid, name } = dto;

        const existing = await this.playerRepo.findOne({ where: { playerUid } });
        if (existing) {
            if (name && existing.name !== name) {
                existing.name = name;
                await this.playerRepo.save(existing);
            }
            return {
                message: 'Success',
                data: { id: existing.id, playerUid: existing.playerUid, name: existing.name },
            };
        }
        try {
            const player = this.playerRepo.create({ playerUid, name });
            const savedPlayer = await this.playerRepo.save(player);
            return {
                message: 'Success',
                data: { id: savedPlayer.id, playerUid: savedPlayer.playerUid, name: savedPlayer.name },
            };
        } catch (error: any) {
            if (error.code === '23505') {
                const paralle = await this.playerRepo.findOne({ where: { playerUid } });
                return {
                    message: 'Success',
                    data: { id: paralle?.id, playerUid: paralle?.playerUid, name: paralle?.name },
                };
            }
            throw error;
        }
    }
}
