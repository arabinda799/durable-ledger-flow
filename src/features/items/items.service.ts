import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from './entities/items.entity';
import { Like, Repository } from 'typeorm';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ApiResponse } from 'src/common/interfaces/api-response.interface';

@Injectable()
export class ItemsService {

    constructor(
        @InjectRepository(Item)
        private readonly itemRepo: Repository<Item>,
    ) { }


    async create(dto: AddItemDto): Promise<ApiResponse<any>> {
        try {
            const { itemCode, itemName, price } = dto;
            const item = this.itemRepo.create({ itemCode, itemName, price });
            const savedItem = await this.itemRepo.save(item);

            return {
                message: 'Item added successfully',
                data: { itemCode: savedItem.itemCode, itemName: savedItem.itemName, price: savedItem.price },
            };
        } catch (error: any) {
            if (error.code === '23505') {
                throw new ConflictException('Item with this itemCode already exists');
            }
            throw error;
        }
    }

    async update(itemCode: string, dto: UpdateItemDto): Promise<ApiResponse<any>> {
        const item = await this.itemRepo.findOne({ where: { itemCode } });
        if (!item) {
            throw new NotFoundException(`Item with code ${itemCode} not found`);
        }

        Object.assign(item, dto);
        const updatedItem = await this.itemRepo.save(item);

        return {
            message: 'Item updated successfully',
            data: {
                itemCode: updatedItem.itemCode,
                itemName: updatedItem.itemName,
                price: updatedItem.price,
                isActive: updatedItem.isActive,
            },
        };
    }

    async findOne(itemCode: string): Promise<ApiResponse<any>> {
        const item = await this.itemRepo.findOne({ where: { itemCode }, });
        if (!item) {
            throw new NotFoundException(`Item with code ${itemCode} not found`);
        }
        return {
            message: 'Success',
            data: {
                itemCode: item.itemCode,
                itemName: item.itemName,
                price: item.price,
                isActive: item.isActive,
            },
        };
    }

    async findAll(q?: string): Promise<ApiResponse<any>> {
        let whereClause: any = { isActive: true };
        if (q) {
            whereClause = [
                { itemCode: Like(`%${q}%`), isActive: true },
                { itemName: Like(`%${q}%`), isActive: true },
            ];
        }

        const items = await this.itemRepo.find({ where: whereClause });

        return {
            message: 'Items retrieved successfully',
            data: items.map((item) => ({
                itemCode: item.itemCode,
                itemName: item.itemName,
                price: item.price,
                isActive: item.isActive,
            })),
        };
    }
}
