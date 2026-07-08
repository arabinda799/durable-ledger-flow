import { IsString, IsNotEmpty, IsInt, Min, MaxLength, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRewardDto {
  @MaxLength(100, { message: "Reward code must be max 100 characters long" })
  @IsString({ message: "Reward code must be a valid string" })
  @IsNotEmpty({ message: "Reward Code is required" })
  rewardCode: string;

  @MaxLength(100, { message: "Reward name must be maximum 100 characters long" })
  @IsString({ message: "Reward name must be a valid string" })
  @IsNotEmpty({ message: "Reward name is required" })
  rewardName: string;

  @MaxLength(30, { message: "Reward type must be max 30 characters long" })
  @IsString({ message: "Reward type must be a valid string" })
  @IsNotEmpty({ message: "Reward type is required" })
  rewardType: string;

  @Min(1, { message: "Reward amount must be at least 1" })
  @IsInt({ message: "Reward amount must be a valid integer" })
  @IsNotEmpty({ message: "Reward amount is required" })
  rewardAmount: number;

  @IsDate({ message: "Start date must be a valid date" })
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @IsDate({ message: "End date must be a valid date" })
  @IsOptional()
  @Type(() => Date)
  endDate?: Date;
}
