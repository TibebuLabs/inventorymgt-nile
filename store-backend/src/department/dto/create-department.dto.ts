import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateDepartmentDto {
  @ApiProperty({
    description: 'The name of the department',
    example: 'IT Department',
  })
  @IsString()
  department_name: string;

  @ApiProperty({
    description: 'The ID of the department head (optional)',
    required: false,
    example: 0,
  })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => (value === 0 ? null : value)) // Transform 0 to null
  department_head_id?: number;
}
