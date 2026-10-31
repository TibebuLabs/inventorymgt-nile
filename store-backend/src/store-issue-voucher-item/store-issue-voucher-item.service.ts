import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service'; // Import Prisma service
import { CreateStoreIssueVoucherItemDto } from './dto/create-store-issue-voucher-item.dto';
import { UpdateStoreIssueVoucherItemDto } from './dto/update-store-issue-voucher-item.dto';

@Injectable()
export class StoreIssueVoucherItemService {
  constructor(private readonly prisma: PrismaService) {} // Inject Prisma service

  async create(data: CreateStoreIssueVoucherItemDto) {
    const newItem = await this.prisma.storeIssueVoucherItem.create({
      data: data,
    });
    return newItem;
  }

  async findAll() {
    return this.prisma.storeIssueVoucherItem.findMany();
  }

  async findOne(id: number) {
    const item = await this.prisma.storeIssueVoucherItem.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException(`Item with ID ${id} not found`);
    return item;
  }

  async update(id: number, dto: UpdateStoreIssueVoucherItemDto) {
    const item = await this.prisma.storeIssueVoucherItem.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException(`Item with ID ${id} not found`);

    const updatedItem = await this.prisma.storeIssueVoucherItem.update({
      where: { id },
      data: dto,
    });
    return updatedItem;
  }

  async remove(id: number) {
    const item = await this.prisma.storeIssueVoucherItem.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException(`Item with ID ${id} not found`);

    await this.prisma.storeIssueVoucherItem.delete({
      where: { id },
    });
    return { message: `Item with ID ${id} deleted successfully` };
  }
}
