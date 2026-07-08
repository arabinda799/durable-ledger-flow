import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestCollection } from './entities/request-collection.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RequestCollection])],
  exports: [TypeOrmModule],
})
export class RequestCollectionModule { }
