import { PartialType } from '@nestjs/mapped-types';
import { CreateStoreIssueVoucherDto } from './create-store-issue-voucher.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStoreIssueVoucherDto extends PartialType(
  CreateStoreIssueVoucherDto,
) {
  @ApiProperty({
    description: 'Optional issued to update',
    example: 'Jane Doe',
    required: false,
  })
  issued_to?: string;
}
