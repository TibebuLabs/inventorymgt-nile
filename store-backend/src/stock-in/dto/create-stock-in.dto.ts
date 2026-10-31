// src/stock-in/dto/create-stock-in.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber } from 'class-validator';

export class CreateStockInDto {
  @ApiProperty({
    example: 100,
    description: 'The quantity of the stock item being added',
  })
  @IsInt()
  quantity: number;

  @ApiProperty({
    example: 12345,
    description: 'The reference key associated with the stock-in transaction',
  })
  @IsInt()
  ref_key: number; // Adjusted field name to match Prisma model

  @ApiProperty({
    example: 15.75,
    description: 'The unit price of the stock item',
  })
  @IsNumber()
  unit_price: number; // Adjusted field name to match Prisma model

  @ApiProperty({
    example: 1575,
    description: 'The total price of the stock item (quantity * unitPrice)',
  })
  @IsNumber()
  total_price: number; // Adjusted field name to match Prisma model
}
// src/stock-in/stock-in.controller.ts
