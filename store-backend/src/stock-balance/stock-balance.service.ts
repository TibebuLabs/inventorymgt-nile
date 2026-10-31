// src/stock-balance/stock-balance.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateStockBalanceDto } from './dto/create-stock-balance.dto';
import { UpdateStockBalanceDto } from './dto/update-stock-balance.dto';

@Injectable()
export class StockBalanceService {
  constructor(private prisma: PrismaService) {}

  async create(createStockBalanceDto: CreateStockBalanceDto) {
    return this.prisma.stockBalance.create({
      data: createStockBalanceDto,
    });
  }

  async findAll() {
    return this.prisma.stockBalance.findMany();
  }

  /**
   * Returns the most recent stock balance across ALL items.
   * @deprecated Use findLastBalanceByScc(sccId) for per-item balance lookups.
   */
  async findbyLastStockBalance() {
    return this.prisma.stockBalance.findFirst({
      where: { last_stock_balance: true },
      orderBy: { id: 'desc' },
    });
  }

  /**
   * Returns the most recent stock balance for a SPECIFIC Stock Control Card.
   * This is the correct method to use in addtostock / out-stock services so
   * that stock movements for different items don't corrupt each other.
   */
  async findLastBalanceByScc(sccId: number) {
    return this.prisma.stockBalance.findFirst({
      where: {
        last_stock_balance: true,
        referance_scc: { scc_id: sccId },
      },
      include: { referance_scc: true },
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.stockBalance.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateStockBalanceDto: UpdateStockBalanceDto) {
    return this.prisma.stockBalance.update({
      where: { id },
      data: updateStockBalanceDto,
    });
  }

  async remove(id: number) {
    return this.prisma.stockBalance.delete({
      where: { id },
    });
  }
}
