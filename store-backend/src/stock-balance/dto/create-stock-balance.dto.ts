import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNumber } from 'class-validator';

export class CreateStockBalanceDto {
  @ApiProperty({
    example: 50,
    description: 'The quantity of the stock item',
  })
  @IsInt()
  quantity: number;

  @ApiProperty({
    example: 10.5,
    description: 'The unit price of the stock item',
  })
  @IsNumber()
  unit_price: number; // Adjusted to match the Prisma model field

  @ApiProperty({
    example: 525,
    description: 'The total price of the stock item (quantity * unit_price)',
  })
  @IsNumber()
  total_price: number; // Adjusted to match the Prisma model field

  @ApiProperty({
    example: true,
    description: 'check the  last stock balance',
  })
  @IsBoolean({})
  last_stock_balance: boolean;

  @ApiProperty({
    example: 12345,
    description: 'The reference key associated with the stock balance',
  })
  @IsInt()
  ref_key: number; // Adjusted to match the Prisma model field
}
