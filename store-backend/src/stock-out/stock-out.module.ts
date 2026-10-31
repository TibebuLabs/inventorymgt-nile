import { Module } from '@nestjs/common';
import { StockOutService } from './stock-out.service';
import { StockOutController } from './stock-out.controller';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [StockOutService],
  controllers: [StockOutController],
})
export class StockOutModule {}
