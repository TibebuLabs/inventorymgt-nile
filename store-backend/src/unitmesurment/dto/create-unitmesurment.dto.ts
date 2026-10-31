// src/unit-measurement/dto/create-unit-measurement.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUnitMeasurementDto {
  @ApiProperty({
    description: 'The unit of measurement',
    example: 'Kilogram',
  })
  @IsNotEmpty() // Ensures the value is not empty
  @IsString() // Ensures the value is a string
  unit: string; // No "?" means this property is required
}
