import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

/** The item with its related unit + type + location, as returned by the API. */
const ITEM_INCLUDE = {
  unit_measurement: true,
  type: true,
  location: true,
} as const;

@Injectable()
export class ItemService {
  constructor(private prisma: PrismaService) {}

  /** Accept both `unitMeasurement_id` and `unit_measurement_id`. */
  private resolveUnitId(dto: {
    unitMeasurement_id?: number;
    unit_measurement_id?: number;
  }): number | undefined {
    return dto.unitMeasurement_id ?? dto.unit_measurement_id;
  }

  private handleWriteError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('An item with this name already exists.');
      }
      if (error.code === 'P2003') {
        throw new BadRequestException(
          'The selected item type, unit of measurement, or location does not exist.',
        );
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('Item not found.');
      }
    }
    throw error;
  }

  async create(createItemDto: CreateItemDto) {
    const unitId = this.resolveUnitId(createItemDto);

    if (!unitId) {
      throw new BadRequestException(
        'A unit of measurement is required when creating an item.',
      );
    }

    try {
      return await this.prisma.item.create({
        data: {
          name: createItemDto.name.trim(),
          sku: createItemDto.sku?.trim() ?? null,
          type_id: createItemDto.type_id,
          unit_measurement_id: unitId,
          location_id: createItemDto.location_id ?? null,
          reorder_level: createItemDto.reorder_level ?? 0,
        },
        include: ITEM_INCLUDE,
      });
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async findAll() {
    return this.prisma.item.findMany({
      include: ITEM_INCLUDE,
      orderBy: [{ location: { name: 'asc' } }, { name: 'asc' }],
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.item.findUnique({
      where: { id },
      include: ITEM_INCLUDE,
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found.`);
    }

    return item;
  }

  async update(id: number, updateItemDto: UpdateItemDto) {
    const data: Prisma.ItemUpdateInput = {};

    if (updateItemDto.name !== undefined) {
      data.name = updateItemDto.name.trim();
    }
    if (updateItemDto.sku !== undefined) {
      data.sku = updateItemDto.sku.trim() || null;
    }
    if (updateItemDto.type_id !== undefined) {
      data.type = { connect: { id: updateItemDto.type_id } };
    }

    const unitId = this.resolveUnitId(updateItemDto);
    if (unitId !== undefined) {
      data.unit_measurement = { connect: { id: unitId } };
    }

    if (updateItemDto.location_id !== undefined) {
      data.location = updateItemDto.location_id
        ? { connect: { id: updateItemDto.location_id } }
        : { disconnect: true };
    }

    if (updateItemDto.reorder_level !== undefined) {
      data.reorder_level = updateItemDto.reorder_level;
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('No fields were provided to update.');
    }

    try {
      return await this.prisma.item.update({
        where: { id },
        data,
        include: ITEM_INCLUDE,
      });
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.item.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          'This item is used by existing vouchers and cannot be deleted.',
        );
      }
      this.handleWriteError(error);
    }
  }

  /** Find items by location - used for location-based stock lookup */
  async findByLocation(locationId: number) {
    return this.prisma.item.findMany({
      where: { location_id: locationId },
      include: ITEM_INCLUDE,
      orderBy: { name: 'asc' },
    });
  }

  /** Find items by category - used for category-based stock lookup */
  async findByCategory(category: string) {
    return this.prisma.item.findMany({
      where: {
        location: {
          category: { contains: category, mode: 'insensitive' },
        },
      },
      include: ITEM_INCLUDE,
      orderBy: { name: 'asc' },
    });
  }

  /** Search items by name, SKU, or location details */
  async searchItems(search: string) {
    return this.prisma.item.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          {
            location: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { aisle: { contains: search, mode: 'insensitive' } },
                { shelf: { contains: search, mode: 'insensitive' } },
                { bin: { contains: search, mode: 'insensitive' } },
                { category: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        ],
      },
      include: ITEM_INCLUDE,
      orderBy: [{ location: { name: 'asc' } }, { name: 'asc' }],
    });
  }
}
