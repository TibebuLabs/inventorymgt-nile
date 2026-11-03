import { Module } from '@nestjs/common';
import { StoreIssueVoucherService } from './store-issue-voucher.service';
import { StoreIssueVoucherController } from './store-issue-voucher.controller';
import { NotficationsModule } from 'src/notfications/notfications.module';
import { StockModule } from 'src/stock/stock.module';
import { AuditModule } from 'src/audit/audit.module';

@Module({
  controllers: [StoreIssueVoucherController],
  providers: [StoreIssueVoucherService],
  imports: [NotficationsModule, StockModule, AuditModule],
})
export class StoreIssueVoucherModule {}
