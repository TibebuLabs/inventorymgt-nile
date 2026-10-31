import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';

@Injectable()
export class VendorService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVendorDto) {
    const name = dto.name?.trim();
    if (!name) throw new BadRequestException('Vendor name is required');

    const existing = await this.prisma.vendor.findUnique({ where: { name } });
    if (existing) {
      throw new ConflictException(`A vendor named "${name}" already exists`);
    }

    return this.prisma.vendor.create({
      data: {
        name,
        contact_name: dto.contact_name?.trim() || null,
        email: dto.email?.trim().toLowerCase() || null,
        phone: dto.phone?.trim() || null,
        address: dto.address?.trim() || null,
        tax_id: dto.tax_id?.trim() || null,
        notes: dto.notes?.trim() || null,
        is_active: dto.is_active ?? true,
      },
    });
  }

  async findAll(search?: string) {
    return this.prisma.vendor.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { contact_name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { name: 'asc' },
      include: { _count: { select: { grns: true } } },
    });
  }

  async findOne(id: number) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
      include: {
        grns: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: {
            id: true,
            supplier: true,
            date: true,
            status: true,
            total: { select: { total_price: true } },
          },
        },
      },
    });
    if (!vendor) throw new NotFoundException(`Vendor ${id} not found`);
    return vendor;
  }

  async update(id: number, dto: UpdateVendorDto) {
    await this.findOne(id);

    if (dto.name) {
      const clash = await this.prisma.vendor.findFirst({
        where: { name: dto.name.trim(), id: { not: id } },
      });
      if (clash) {
        throw new ConflictException(
          `A vendor named "${dto.name.trim()}" already exists`,
        );
      }
    }

    return this.prisma.vendor.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.contact_name !== undefined && {
          contact_name: dto.contact_name?.trim() || null,
        }),
        ...(dto.email !== undefined && {
          email: dto.email?.trim().toLowerCase() || null,
        }),
        ...(dto.phone !== undefined && { phone: dto.phone?.trim() || null }),
        ...(dto.address !== undefined && {
          address: dto.address?.trim() || null,
        }),
        ...(dto.tax_id !== undefined && { tax_id: dto.tax_id?.trim() || null }),
        ...(dto.notes !== undefined && { notes: dto.notes?.trim() || null }),
        ...(dto.is_active !== undefined && { is_active: dto.is_active }),
      },
    });
  }

  async remove(id: number) {
    const vendor = await this.findOne(id);
    const grnCount = await this.prisma.grn.count({ where: { vendor_id: id } });
    if (grnCount > 0) {
      // Never destroy procurement history — deactivate instead.
      return this.prisma.vendor.update({
        where: { id: vendor.id },
        data: { is_active: false },
      });
    }
    return this.prisma.vendor.delete({ where: { id } });
  }
}
