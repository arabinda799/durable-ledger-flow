import { Controller, Post, Get, Patch, Body, Param, Query } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { ClaimRewardDto } from './dto/claim-reward.dto';
import { Reward } from './entities/rewards.entity';
import { ApiResponse } from 'src/common/interfaces/api-response.interface';

@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Post()
  async create(@Body() dto: CreateRewardDto): Promise<ApiResponse<any>> {
    return this.rewardsService.create(dto);
  }

  @Get()
  async findAll(@Query('q') q?: string): Promise<ApiResponse<any>> {
    return this.rewardsService.findAll(q);
  }

  @Get(':rewardCode')
  async findOne(@Param('rewardCode') rewardCode: string): Promise<ApiResponse<any>> {
    return this.rewardsService.findOne(rewardCode);
  }

  @Patch(':rewardCode')
  async update(
    @Param('rewardCode') rewardCode: string,
    @Body() dto: UpdateRewardDto,
  ): Promise<ApiResponse<any>> {
    return this.rewardsService.update(rewardCode, dto);
  }

  @Post(':rewardId/claim')
  async claim(
    @Param('rewardId') rewardId: string,
    @Body() dto: ClaimRewardDto,
  ): Promise<{ message: string; balance: number }> {
    return this.rewardsService.claim(rewardId, dto);
  }
}
