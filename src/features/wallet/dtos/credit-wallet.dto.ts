import { IsInt, Min, IsString, IsNotEmpty, MaxLength, IsPositive } from 'class-validator';

export class CreditWalletDto {
    @IsPositive({ message: 'Amount should be positive' })
    @Min(1, { message: 'Minimum value should be 1' })
    @IsInt({ message: 'Amount should be a valid integer' })
    @IsNotEmpty({ message: 'Amount is required' })
    amount: number;

    @IsString({ message: 'Reason must be a string' })
    @IsNotEmpty({ message: 'Reason is required' })
    @MaxLength(255, { message: 'Reason must not exceed 255 characters' })
    reason: string;
}
