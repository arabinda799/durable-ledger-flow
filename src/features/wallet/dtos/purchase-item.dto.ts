import { IsInt, Min, IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class PurchaseItemDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    itemCode: string;

    @IsInt()
    @Min(1)
    price: number;
}
