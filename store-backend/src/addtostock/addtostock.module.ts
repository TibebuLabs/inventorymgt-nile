import { Module } from '@nestjs/common';
import { AddtostockService } from './addtostock.service';
import { AddtostockController } from './addtostock.controller';
import { StockModule } from 'src/stock/stock.module';

@Module({
  imports: [StockModule],
  controllers: [AddtostockController],
  providers: [AddtostockService],
})
export class AddtostockModule {}
