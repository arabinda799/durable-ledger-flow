import { Controller, Post, Patch, Get, Body, Param, Query } from '@nestjs/common';
import { ItemsService } from './items.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  async create(@Body() dto: AddItemDto) {
    return this.itemsService.create(dto);
  }

  @Patch(':itemCode')
  async update(@Param('itemCode') itemCode: string, @Body() dto: UpdateItemDto) {
    return this.itemsService.update(itemCode, dto);
  }

  @Get(':itemCode')
  async findOne(@Param('itemCode') itemCode: string) {
    return this.itemsService.findOne(itemCode);
  }

  @Get()
  async findAll(@Query('q') q?: string) {
    return this.itemsService.findAll(q);
  }
}
