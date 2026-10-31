import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class CreateSrnItemDto {
  @ApiProperty({ description: 'SRN Key (Foreign Key)', example: 1 })
  @IsInt()
  srn_id: number; // Adjusted field name to match Prisma model

  @ApiProperty({ description: 'Serial Number', example: 101 })
  @IsInt()
  serial_num: number; // Adjusted field name to match Prisma model

  @ApiProperty({
    description: 'Description (References Item Name)',
    example: 'Paper',
  })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Unit Measurement ID (Foreign Key)', example: 5 })
  @IsInt()
  unit_measurement_id: number; // Adjusted field name to match Prisma model

  @ApiProperty({ description: 'Quantity', example: 50 })
  @IsInt()
  quantity: number;

  @ApiProperty({ description: 'Remarks', example: 'In good condition' })
  @IsString()
  remarks: string;
}
