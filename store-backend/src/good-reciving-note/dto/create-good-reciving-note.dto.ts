import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsString,
  IsOptional,
  IsDate,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { CreateGrnItemDto } from '../../grnitem/dto/create-grnitem.dto';

export class CreateGrnDto {
  @ApiProperty({
    example: '2023-10-01T00:00:00.000Z',
    description: 'The date of the GRN (Goods Received Note)',
  })
  @Type(() => Date)
  @Transform(({ value }) => (value instanceof Date ? value : new Date(value)))
  @IsDate()
  date: Date;

  @ApiPropertyOptional({
    example: 'ABC Suppliers',
    description:
      'Supplier name. Optional when vendor_id is provided (it is then taken from the vendor record).',
  })
  @IsOptional()
  @IsString()
  supplier?: string;

  @ApiPropertyOptional({
    example: 3,
    description: 'Registered vendor id (preferred over free-text supplier).',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  vendor_id?: number;

  @ApiProperty({
    example: 'INV12345',
    description: "The supplier's invoice or other reference number",
  })
  @IsString()
  suppliers_inv_other_no: string;

  @ApiProperty({
    example: 'Warehouse A',
    description: 'The location where the goods are stored',
  })
  @IsString()
  store_location: string;

  @ApiProperty({
    example: 1001,
    description: 'The purchase requisition number',
  })
  @IsInt()
  @Type(() => Number)
  purchase_req_num: number;

  @ApiProperty({
    example: 2001,
    description: 'The purchase order number',
  })
  @IsInt()
  @Type(() => Number)
  purchase_order_num: number;

  @ApiPropertyOptional({
    example: 3001,
    description: 'The preparer employee id (defaults to the signed-in user)',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  prepared_by_id?: number;

  @ApiPropertyOptional({
    example: 5001,
    description: 'The total ID reference (optional)',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  total_id?: number;

  @ApiProperty({
    type: [CreateGrnItemDto],
    description: 'List of items included in the GRN',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGrnItemDto)
  grn_items: CreateGrnItemDto[];
}
