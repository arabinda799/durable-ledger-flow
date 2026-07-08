import { IsString, IsNotEmpty, IsInt, Min, MaxLength } from 'class-validator';

export class AddItemDto {
    @MaxLength(100, { message: 'Item code must be at most 100 characters long' })
    @IsString({ message: 'Item code should be string' })
    @IsNotEmpty({ message: 'Item Code Should not be empty' })
    itemCode: string;

    @MaxLength(100, { message: 'Item name must be at most 100 characters long' })
    @IsString({ message: 'Item name should be string' })
    @IsNotEmpty({ message: 'Item name should not be empty' })
    itemName: string;

    @Min(1, { message: 'Price must be at least 1' })
    @IsInt({ message: 'Item price should be valid integer' })
    price: number;
}
