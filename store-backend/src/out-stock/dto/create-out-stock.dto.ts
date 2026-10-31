import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class CreateOutStockDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the approved SRN to issue stock for',
  })
  @IsInt()
  @IsPositive()
  id: number;
}
