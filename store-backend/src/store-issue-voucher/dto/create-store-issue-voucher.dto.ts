import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsDateString,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

// ── Nested item DTO (store_issue_key is set by the service, not the client) ──
export class CreateSivItemDto {
  @ApiProperty({ description: 'Item (description) ID', example: 1 })
  @IsInt()
  @Type(() => Number)
  description_id: number;

  @ApiProperty({ description: 'Unit measurement ID', example: 2 })
  @IsInt()
  @Type(() => Number)
  unit_measurement_id: number;

  @ApiProperty({ description: 'Requested quantity', example: 10 })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  requested: number;

  @ApiProperty({ description: 'Issued quantity', example: 8 })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  issued: number;

  @ApiProperty({ description: 'Out-of-stock quantity', example: 2 })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  out_of_stock: number;

  @ApiPropertyOptional({
    description:
      'Unit price hint. The server overrides this with the current stock cost.',
    example: 50.5,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  unit_price?: number;

  @ApiPropertyOptional({ description: 'Line total (computed server-side)' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  total_price?: number;

  @ApiPropertyOptional({ description: 'Remark', example: 'Replacement' })
  @IsOptional()
  @IsString()
  remark?: string;
}

// ── Main voucher DTO ─────────────────────────────────────────────────────────
export class CreateStoreIssueVoucherDto {
  @ApiProperty({
    description: 'Name of the person / department the voucher is issued to',
    example: 'Finance Department',
  })
  @IsString()
  issued_to: string;

  @ApiProperty({ description: 'Store request number reference', example: 101 })
  @IsInt()
  @Type(() => Number)
  store_req_no: number;

  @ApiProperty({
    description: 'Date of issue (ISO 8601)',
    example: '2024-03-10T00:00:00.000Z',
  })
  @IsDateString()
  date: Date;

  @ApiPropertyOptional({
    description: 'Approved SRN this voucher fulfils (links the workflow).',
    example: 12,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  srn_id?: number;

  @ApiProperty({
    description: 'Items included in this voucher',
    type: [CreateSivItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSivItemDto)
  siv_items: CreateSivItemDto[];
}
