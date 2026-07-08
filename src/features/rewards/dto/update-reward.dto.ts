import { IsString, IsNotEmpty, IsInt, Min, MaxLength, IsOptional, IsDate, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateRewardDto {
  @IsOptional()
  @IsString({ message: "Reward name must be a valid string" })
  @IsNotEmpty({ message: "Reward name cannot be empty" })
  @MaxLength(100, { message: "Reward name must be max 100 characters long" })
  rewardName?: string;

  @IsOptional()
  @IsString({ message: "Reward type must be a valid string" })
  @IsNotEmpty({ message: "Reward type cannot be empty" })
  @MaxLength(30, { message: "Reward type must be max 30 characters long" })
  rewardType?: string;

  @IsOptional()
  @Min(1, { message: "Reward amount must be at least 1" })
  @IsInt({ message: "Reward amount must be a valid integer" })
  rewardAmount?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: "Start date must be a valid date" })
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: "End date must be a valid date" })
  endDate?: Date;

  @IsOptional()
  @IsBoolean({ message: "isActive must be a boolean value" })
  isActive?: boolean;
}
