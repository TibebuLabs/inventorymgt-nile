import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsEmail,
  IsOptional,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateEmployeeDto {
  @ApiProperty({
    description: 'The full name of the employee',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({
    description: 'The ID of the department the employee belongs to',
    example: 1,
  })
  @IsInt()
  @Min(1, { message: 'Department ID must be a positive integer.' })
  department_id: number;

  @ApiProperty({
    description: 'The email address of the employee',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The phone number of the employee (optional)',
    example: '0945678900',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? null : value)) // Transform empty string to null
  phone?: string;

  @ApiProperty({
    description: 'The password for the employee account',
    example: 'securePassword123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'The ID of the role assigned to the employee',
    example: 2,
  })
  @IsInt()
  @Min(1, { message: 'Role ID must be a positive integer.' })
  role_id: number;
}
