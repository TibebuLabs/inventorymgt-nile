import { Module } from '@nestjs/common';
import { StoreIssueVoucherService } from './store-issue-voucher.service';
import { StoreIssueVoucherController } from './store-issue-voucher.controller';
import { NotficationsModule } from 'src/notfications/notfications.module';
import { StockModule } from 'src/stock/stock.module';

@Module({
  controllers: [StoreIssueVoucherController],
  providers: [StoreIssueVoucherService],
  imports: [NotficationsModule, StockModule],
})
export class StoreIssueVoucherModule {}
