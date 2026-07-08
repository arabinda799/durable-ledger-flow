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
        const { playerUid } = dto;

        const existing = await this.playerRepo.findOne({ where: { playerUid }, select: { playerUid: true } });
        if (existing) {
            return {
                message: 'Success',
                data: { playerUid: existing.playerUid },
            };
        }
        try {
            const player = this.playerRepo.create({ playerUid });
            const savedPlayer = await this.playerRepo.save(player);
            return {
                message: 'Success',
                data: { playerUid: savedPlayer.playerUid },
            };
        } catch (error: any) {
            if (error.code === '23505') {
                const parallelPlayer = await this.playerRepo.findOne({ where: { playerUid }, select: { playerUid: true } });
                return {
                    message: 'Success',
                    data: { playerUid: parallelPlayer?.playerUid },
                };
            }
            throw error;
        }
    }
}
