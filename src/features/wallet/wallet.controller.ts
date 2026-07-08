import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CreditWalletDto } from './dtos/credit-wallet.dto';
import { PurchaseItemDto } from './dtos/purchase-item.dto';
import { ApiResponse } from 'src/common/interfaces/api-response.interface';

@Controller('wallet')
export class WalletController {
    constructor(private readonly walletService: WalletService) {}

    @Post(':playerUid/credit')
    async credit(
        @Param('playerUid') playerUid: string,
        @Body() dto: CreditWalletDto,
    ): Promise<ApiResponse<any>> {
        return this.walletService.credit(playerUid, dto);
    }

    @Post(':playerUid/purchase')
    async purchase(
        @Param('playerUid') playerUid: string,
        @Body() dto: PurchaseItemDto,
    ): Promise<ApiResponse<any>> {
        return this.walletService.purchase(playerUid, dto);
    }

    @Get(':playerUid')
    async getWallet(
        @Param('playerUid') playerUid: string,
    ): Promise<ApiResponse<any>> {
        return this.walletService.getWallet(playerUid);
    }
}

