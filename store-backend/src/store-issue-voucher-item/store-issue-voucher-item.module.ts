import { Module } from '@nestjs/common';
import { StoreIssueVoucherItemService } from './store-issue-voucher-item.service';
import { StoreIssueVoucherItemController } from './store-issue-voucher-item.controller';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  controllers: [StoreIssueVoucherItemController],
  providers: [StoreIssueVoucherItemService],

  imports: [PrismaModule],
})
export class StoreIssueVoucherItemModule {}
