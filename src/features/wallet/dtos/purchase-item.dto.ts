import { IsInt, Min, IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class PurchaseItemDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    itemId: string;

    @IsInt()
    @Min(1)
    price: number;
}
