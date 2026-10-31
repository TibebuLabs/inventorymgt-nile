import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGrnItemDto {
  /**
   * Assigned by the server when the item is nested inside a GRN payload.
   * Kept optional so clients can also post a standalone item.
   */
  @ApiPropertyOptional({
    example: 101,
    description: 'GRN ID this item belongs to (assigned automatically)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  grn_id?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Serial number of the item in the GRN (assigned automatically)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  ser_no?: number;

  @ApiProperty({
    example: 1,
    description: 'Item ID this description belongs to',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  description: number; // The description refers to the Item ID

  @ApiProperty({
    example: 2,
    description: 'Unit of measurement ID (e.g., kilograms, liters, etc.)',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  unit_measurement_id: number;

  @ApiPropertyOptional({ example: 50, description: 'Quantity ordered' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  qua_ordered?: number;

  @ApiProperty({ example: 45, description: 'Quantity delivered' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  qua_delivered: number;

  @ApiPropertyOptional({ example: 45, description: 'Quantity received' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantity_received?: number;

  @ApiProperty({ example: 20.5, description: 'Unit price of the item' })
  @Type(() => Number)
  @IsNumber()
  unit_price: number;

  @ApiPropertyOptional({
    example: 'Received in good condition',
    description: 'Optional remarks for the item',
  })
  @IsString()
  @IsOptional()
  remark?: string;
}
