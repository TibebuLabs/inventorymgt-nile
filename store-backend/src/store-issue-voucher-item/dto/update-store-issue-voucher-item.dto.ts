import { PartialType } from '@nestjs/mapped-types';
import { CreateStoreIssueVoucherItemDto } from './create-store-issue-voucher-item.dto';

export class UpdateStoreIssueVoucherItemDto extends PartialType(
  CreateStoreIssueVoucherItemDto,
) {}
