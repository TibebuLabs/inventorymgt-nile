import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateItemTypeDto {
  @ApiProperty({
    description: 'The name of the item type',
    example: 'Pen',
  })
  @IsNotEmpty() // Ensures the value is not empty
  type: string;
}
