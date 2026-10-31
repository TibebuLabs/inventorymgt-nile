// src/stock-balance/stock-balance.module.ts
import { Module } from '@nestjs/common';
import { StockBalanceService } from './stock-balance.service';
import { StockBalanceController } from './stock-balance.controller';

@Module({
  controllers: [StockBalanceController],
  providers: [StockBalanceService],
})
export class StockBalanceModule {}
