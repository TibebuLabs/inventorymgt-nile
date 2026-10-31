import {
  IsString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateItemDto {
  @ApiProperty({ description: 'Name of the item', example: 'A4 Paper' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional({
    description: 'SKU / item code (optional)',
    example: 'PAP-A4-001',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  sku?: string;

  /**
   * Canonical field name used by the frontend.
   * Prisma calls the column `unit_measurement_id`, so we accept both
   * spellings and normalise in the service layer.
   */
  @ApiPropertyOptional({
    description: 'ID of the unit measurement',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  unitMeasurement_id?: number;

  @ApiPropertyOptional({
    description: 'ID of the unit measurement (Prisma-style alias)',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  unit_measurement_id?: number;

  @ApiProperty({ description: 'ID of the item type', example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  type_id: number;

  @ApiPropertyOptional({
    description: 'ID of the storage location (aisle/shelf/bin)',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  location_id?: number;

  @ApiPropertyOptional({
    description: 'Reorder level for low-stock alerts',
    example: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  reorder_level?: number;
}
