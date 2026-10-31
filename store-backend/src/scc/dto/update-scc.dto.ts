import { ApiProperty } from '@nestjs/swagger';

export class UpdateSccDto {
  @ApiProperty({
    description: 'Name of the item',
    example: 'Item A',
    required: false,
  })
  item?: string;

  @ApiProperty({
    description: 'Location shelves number',
    example: 'Shelf 1',
    required: false,
  })
  locationShelvesNo?: string;

  @ApiProperty({
    description: 'Maximum stock level',
    example: 100,
    required: false,
  })
  maxStockLevel?: number;

  @ApiProperty({
    description: 'Minimum stock level',
    example: 10,
    required: false,
  })
  minStockLevel?: number;

  @ApiProperty({
    description: 'Reference key',
    example: 12345,
    required: false,
  })
  referanceKey?: number;
}
