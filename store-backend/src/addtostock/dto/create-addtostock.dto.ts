import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class CreateAddtostockDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the approved GRN to add to stock',
  })
  @IsInt()
  @IsPositive()
  id: number;
}
