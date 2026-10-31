import { Module } from '@nestjs/common';
import { OutStockService } from './out-stock.service';
import { OutStockController } from './out-stock.controller';
import { StockModule } from 'src/stock/stock.module';

@Module({
  controllers: [OutStockController],
  providers: [OutStockService],
  imports: [StockModule],
})
export class OutStockModule {}
