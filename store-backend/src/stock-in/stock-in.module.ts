// src/stock-in/stock-in.module.ts
import { Module } from '@nestjs/common';
import { StockInService } from './stock-in.service';
import { StockInController } from './stock-in.controller';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StockInController],
  providers: [StockInService],
})
export class StockInModule {}
