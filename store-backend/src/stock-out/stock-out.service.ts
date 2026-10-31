// src/stock-out/stock-out.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateStockOutDto } from './dto/create-stock-out.dto';
import { UpdateStockOutDto } from './dto/update-stock-out.dto';

@Injectable()
export class StockOutService {
  constructor(private prisma: PrismaService) {}

  async create(createStockOutDto: CreateStockOutDto) {
    return this.prisma.stockOut.create({
      data: createStockOutDto,
    });
  }

  async findAll() {
    return this.prisma.stockOut.findMany();
  }

  async findOne(id: number) {
    return this.prisma.stockOut.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateStockOutDto: UpdateStockOutDto) {
    return this.prisma.stockOut.update({
      where: { id },
      data: updateStockOutDto,
    });
  }

  async remove(id: number) {
    return this.prisma.stockOut.delete({
      where: { id },
    });
  }
}
