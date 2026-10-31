import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsString } from 'class-validator';

export class CreateStoreIssueVoucherItemDto {
  @ApiProperty({ description: 'Description ID', example: 1 })
  @IsInt()
  description_id: number;

  @ApiProperty({ description: 'Unit measurement ID', example: 2 })
  @IsInt()
  unit_measurement_id: number;

  @ApiProperty({ description: 'Requested quantity', example: 10 })
  @IsInt()
  requested: number;

  @ApiProperty({ description: 'Issued quantity', example: 8 })
  @IsInt()
  issued: number;

  @ApiProperty({ description: 'Out of stock quantity', example: 2 })
  @IsInt()
  out_of_stock: number;

  @ApiProperty({ description: 'Unit price', example: 50.5 })
  @IsNumber()
  unit_price: number;

  @ApiProperty({ description: 'Total price', example: 404.0 })
  @IsNumber()
  total_price: number;

  @ApiProperty({ description: 'Remark', example: 'Damaged items replaced' })
  @IsString()
  remark: string;

  @ApiProperty({ description: 'Store Issue Voucher Key', example: 101 })
  @IsInt()
  store_issue_key: number;
}
