import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/create-location.dto';

@Injectable()
export class LocationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLocationDto) {
    const name = dto.name?.trim();
    if (!name) throw new BadRequestException('Location name is required');

    const existing = await this.prisma.location.findFirst({ where: { name } });
    if (existing) {
      throw new ConflictException(`A location named "${name}" already exists`);
    }

    return this.prisma.location.create({
      data: {
        name,
        aisle: dto.aisle?.trim() || null,
        shelf: dto.shelf?.trim() || null,
        bin: dto.bin?.trim() || null,
        category: dto.category?.trim() || null,
        description: dto.description?.trim() || null,
        is_active: dto.is_active ?? true,
      },
      include: { _count: { select: { items: true } } },
    });
  }

  async findAll(search?: string) {
    return this.prisma.location.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { aisle: { contains: search, mode: 'insensitive' } },
              { shelf: { contains: search, mode: 'insensitive' } },
              { bin: { contains: search, mode: 'insensitive' } },
              { category: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { name: 'asc' },
      include: { _count: { select: { items: true } } },
    });
  }

  async findOne(id: number) {
    const location = await this.prisma.location.findUnique({
      where: { id },
      include: { _count: { select: { items: true } } },
    });
    if (!location) throw new NotFoundException(`Location ${id} not found`);
    return location;
  }

  async update(id: number, dto: UpdateLocationDto) {
    await this.findOne(id);

    if (dto.name) {
      const clash = await this.prisma.location.findFirst({
        where: { name: dto.name.trim(), id: { not: id } },
      });
      if (clash) {
        throw new ConflictException(
          `A location named "${dto.name.trim()}" already exists`,
        );
      }
    }

    return this.prisma.location.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.aisle !== undefined && { aisle: dto.aisle?.trim() || null }),
        ...(dto.shelf !== undefined && { shelf: dto.shelf?.trim() || null }),
        ...(dto.bin !== undefined && { bin: dto.bin?.trim() || null }),
        ...(dto.category !== undefined && {
          category: dto.category?.trim() || null,
        }),
        ...(dto.description !== undefined && {
          description: dto.description?.trim() || null,
        }),
        ...(dto.is_active !== undefined && { is_active: dto.is_active }),
      },
      include: { _count: { select: { items: true } } },
    });
  }

  async remove(id: number) {
    const location = await this.findOne(id);
    const itemCount = await this.prisma.item.count({
      where: { location_id: id },
    });
    if (itemCount > 0) {
      // Never destroy item history — deactivate instead.
      return this.prisma.location.update({
        where: { id: location.id },
        data: { is_active: false },
      });
    }
    return this.prisma.location.delete({ where: { id } });
  }
}
