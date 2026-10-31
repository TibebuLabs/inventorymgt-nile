import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber } from 'class-validator';

export class CreateStockOutDto {
  @ApiProperty({
    example: 50,
    description: 'The quantity of the stock item being removed',
  })
  @IsInt()
  quantity: number;

  @ApiProperty({
    example: 20.5,
    description: 'The unit price of the stock item',
  })
  @IsNumber()
  unit_price: number;

  @ApiProperty({
    example: 1025,
    description: 'The total price of the stock item (quantity * unit_price)',
  })
  @IsNumber()
  total_price: number;

  @ApiProperty({
    example: 12345,
    description: 'The reference key associated with the stock-out transaction',
  })
  @IsInt()
  ref_key: number;
}
