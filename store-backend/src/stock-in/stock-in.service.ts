// src/stock-in/stock-in.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateStockInDto } from './dto/create-stock-in.dto';
import { UpdateStockInDto } from './dto/update-stock-in.dto';

@Injectable()
export class StockInService {
  constructor(private prisma: PrismaService) {}

  async create(createStockInDto: CreateStockInDto) {
    return this.prisma.stockIn.create({
      data: createStockInDto,
    });
  }

  async findAll() {
    return this.prisma.stockIn.findMany();
  }

  async findOne(id: number) {
    return this.prisma.stockIn.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateStockInDto: UpdateStockInDto) {
    return this.prisma.stockIn.update({
      where: { id },
      data: updateStockInDto,
    });
  }

  async remove(id: number) {
    return this.prisma.stockIn.delete({
      where: { id },
    });
  }
}
