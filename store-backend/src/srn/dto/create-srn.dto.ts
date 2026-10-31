import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CreateSrnLineDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  serial_num?: number;

  @ApiProperty({ description: 'Item name (must exist in the item master)' })
  @IsString()
  description: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Type(() => Number)
  unit_measurement_id: number;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number;

  @ApiPropertyOptional({ example: 'Needed for the finance archive room' })
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class CreateSrnDto {
  @ApiProperty({
    description: 'Requisition work unit or department name',
    example: 'Finance Unit',
  })
  @IsString()
  @MinLength(1)
  requisition_work_unit: string;

  @ApiProperty({
    description: 'Date of the SRN (ISO 8601 string)',
    type: String,
    example: '2024-03-15T00:00:00.000Z',
  })
  @Type(() => Date)
  @IsDate()
  date: Date;

  @ApiPropertyOptional({
    description: 'Approvement ID (optional — set automatically on approval)',
  })
  @IsOptional()
  @IsInt()
  approvment_id?: number;

  @ApiPropertyOptional({ description: 'Requesting employee id (from JWT)' })
  @IsOptional()
  @IsInt()
  requested_by_id?: number;

  @ApiPropertyOptional({
    description: 'Requisition lines. Sent together for an atomic create.',
    type: [CreateSrnLineDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSrnLineDto)
  srn_items?: CreateSrnLineDto[];
}
