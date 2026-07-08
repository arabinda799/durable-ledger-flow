import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { Player } from './features/players/entities/players.entity';
import { Item } from './features/items/entities/items.entity';
import { Wallet } from './features/wallet/entities/wallet.entity';
import { WalletTransaction } from './features/wallet/entities/transactions.entity';
import { Inventory } from './features/wallet/entities/inventories.entity';

import { PlayersModule } from './features/players/players.module';

import { SeedService } from './database/seed.service';
import { ItemsModule } from './features/items/items.module';
import { WalletModule } from './features/wallet/wallet.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_DATABASE', 'game_economy'),
        entities: [Player, Item, Wallet, WalletTransaction, Inventory],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([Player, Item, Wallet, WalletTransaction, Inventory]),
    PlayersModule,
    ItemsModule,
    WalletModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SeedService,
  ],
})
export class AppModule { }

