import { ApiProperty } from '@nestjs/swagger';

export class CreateReferanceSccDto {
  @ApiProperty({ description: 'The SCC key', example: 123 })
  scc_id: number; // Adjusted field name to match Prisma model

  @ApiProperty({ description: 'The date', example: '2023-10-01' })
  date: Date;

  @ApiProperty({ description: 'The GRN key', example: 456, required: false })
  grn_id?: number; // Adjusted field name to match Prisma model

  @ApiProperty({ description: 'The IV key', example: 789, required: false })
  iv_id?: number; // Adjusted field name to match Prisma model

  @ApiProperty({ description: 'The unit measurement ID', example: 1 })
  unit_measurement_id: number; // Adjusted field name to match Prisma model

  @ApiProperty({
    description: 'The stock-in key',
    example: 101,
    required: false,
  })
  stock_in_key?: number; // Adjusted field name to match Prisma model

  @ApiProperty({
    description: 'The stock-out key',
    example: 102,
    required: false,
  })
  stock_out_key?: number; // Adjusted field name to match Prisma model

  @ApiProperty({
    description: 'The stock balance key',
    example: 103,
    required: false,
  })
  stock_balance_key?: number; // Adjusted field name to match Prisma model
}
