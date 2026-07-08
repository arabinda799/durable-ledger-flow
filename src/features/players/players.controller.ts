import { Controller, Post, Body } from '@nestjs/common';
import { PlayersService } from './players.service';
import { PlayerInitDto } from './dto/player-init.dto';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) { }

  @Post()
  async initPlayer(@Body() dto: PlayerInitDto) {
    return await this.playersService.playerInitOrFind(dto);
  }
}
