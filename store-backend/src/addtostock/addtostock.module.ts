import { Module } from '@nestjs/common';
import { AddtostockService } from './addtostock.service';
import { AddtostockController } from './addtostock.controller';
import { StockModule } from 'src/stock/stock.module';
import { AuditModule } from 'src/audit/audit.module';

@Module({
  imports: [StockModule, AuditModule],
  controllers: [AddtostockController],
  providers: [AddtostockService],
})
export class AddtostockModule {}
