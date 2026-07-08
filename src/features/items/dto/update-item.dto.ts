import { IsString, IsNotEmpty, IsInt, Min, MaxLength, IsOptional, IsBoolean } from 'class-validator';

export class UpdateItemDto {
  @IsOptional()
  @MaxLength(100, { message: 'Item name must be at most 100 characters long' })
  @IsString({ message: 'Item name should be string' })
  @IsNotEmpty({ message: 'Item name should not be empty' })
  itemName?: string;

  @IsOptional()
  @Min(1, { message: 'Price must be at least 1' })
  @IsInt({ message: 'Item price should be valid integer' })
  price?: number;

  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean value' })
  isActive?: boolean;
}
