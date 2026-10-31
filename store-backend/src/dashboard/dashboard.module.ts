import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { StockModule } from 'src/stock/stock.module';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
  imports: [StockModule],
})
export class DashboardModule {}
