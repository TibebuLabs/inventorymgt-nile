// src/item-type/item-type.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateItemTypeDto } from './dto/create-itemtype.dto';
import { UpdateItemtypeDto } from './dto/update-itemtype.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ItemTypeService {
  constructor(private prisma: PrismaService) {}

  async create(createItemTypeDto: CreateItemTypeDto) {
    // Validate input
    if (!createItemTypeDto.type || createItemTypeDto.type.trim() === '') {
      throw new BadRequestException('Item type name cannot be empty.');
    }

    try {
      return await this.prisma.itemType.create({
        data: createItemTypeDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle unique constraint violation
        if (error.code === 'P2002') {
          throw new ConflictException(
            'An item type with this name already exists.',
          );
        }
      }
      // Handle other errors
      throw new InternalServerErrorException(
        'An error occurred while creating the item type.',
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.itemType.findMany();
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while fetching item types.',
      );
    }
  }

  async findOne(id: number) {
    try {
      const itemType = await this.prisma.itemType.findUnique({
        where: { id },
      });

      if (!itemType) {
        throw new NotFoundException(`Item type with ID ${id} not found.`);
      }

      return itemType;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while fetching the item type.',
      );
    }
  }

  async update(id: number, updateItemTypeDto: UpdateItemtypeDto) {
    // Validate input
    if (updateItemTypeDto.type && updateItemTypeDto.type.trim() === '') {
      throw new BadRequestException('Item type name cannot be empty.');
    }

    try {
      const itemType = await this.prisma.itemType.findUnique({
        where: { id },
      });

      if (!itemType) {
        throw new NotFoundException(`Item type with ID ${id} not found.`);
      }

      return await this.prisma.itemType.update({
        where: { id },
        data: updateItemTypeDto,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle unique constraint violation
        if (error.code === 'P2002') {
          throw new ConflictException(
            'An item type with this name already exists.',
          );
        }
      }
      throw new InternalServerErrorException(
        'An error occurred while updating the item type.',
      );
    }
  }

  async remove(id: number) {
    try {
      const itemType = await this.prisma.itemType.findUnique({
        where: { id },
      });

      if (!itemType) {
        throw new NotFoundException(`Item type with ID ${id} not found.`);
      }

      return await this.prisma.itemType.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while deleting the item type.',
      );
    }
  }
}
