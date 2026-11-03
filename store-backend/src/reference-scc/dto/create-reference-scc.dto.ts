import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsOptional,
  IsPositive,
} from 'class-validator';

/**
 * Movement header linking an SCC card to the document (GRN / SIV / manual
 * entry) that caused the movement. Field names mirror the Prisma model
 * `ReferanceScc` exactly.
 */
export class CreateReferanceSccDto {
  @ApiProperty({ description: 'The SCC key', example: 123 })
  @IsInt()
  @IsPositive()
  scc_id: number;

  @ApiProperty({ description: 'The date', example: '2023-10-01' })
  @Type(() => Date)
  @IsDate()
  date: Date;

  @ApiProperty({ description: 'The GRN key', example: 456, required: false })
  @IsOptional()
  @IsInt()
  @IsPositive()
  grn_id?: number;

  @ApiProperty({ description: 'The IV key', example: 789, required: false })
  @IsOptional()
  @IsInt()
  @IsPositive()
  iv_id?: number;

  @ApiProperty({ description: 'The unit measurement ID', example: 1 })
  @IsInt()
  @IsPositive()
  unit_measurement_id: number;

  @ApiProperty({
    description: 'The stock-in key',
    example: 101,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  stock_in_key?: number;

  @ApiProperty({
    description: 'The stock-out key',
    example: 102,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  stock_out_key?: number;

  @ApiProperty({
    description: 'The stock balance key',
    example: 103,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  stock_balance_key?: number;
}
