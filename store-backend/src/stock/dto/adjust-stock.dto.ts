import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class AdjustStockDto {
  @ApiPropertyOptional({ description: 'Item id', example: 12 })
  @IsOptional()
  @IsInt()
  itemId?: number;

  @ApiPropertyOptional({ description: 'Item name (if id is omitted)' })
  @IsOptional()
  @IsString()
  item?: string;

  @ApiProperty({
    description: 'Signed quantity change. Positive adds, negative removes.',
    example: -3,
  })
  @IsInt()
  quantity: number;

  @ApiPropertyOptional({ description: 'Unit cost for positive adjustments' })
  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @ApiProperty({ example: 'Stocktake correction' })
  @IsString()
  @MinLength(3)
  reason: string;
}
