import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsString, MinLength } from 'class-validator';

/**
 * DTO for creating a Stock Control Card.
 * NOTE: `referance_key` was removed — it does not exist on the Prisma Scc model.
 */
export class CreateSccDto {
  @ApiProperty({
    description: 'Item name (must match an existing Item.name)',
    example: 'A4 Paper',
  })
  @IsString()
  @MinLength(1)
  item: string;

  @ApiProperty({
    description: 'Physical shelf/location reference',
    example: 'A-12',
  })
  @IsString()
  @MinLength(1)
  location_shelves_no: string;

  @ApiProperty({
    description: 'Maximum stock level threshold',
    example: 100,
  })
  @IsInt()
  @IsPositive()
  max_stock_level: number;

  @ApiProperty({
    description: 'Minimum stock level threshold (reorder point)',
    example: 10,
  })
  @IsInt()
  @IsPositive()
  min_stock_level: number;
}
