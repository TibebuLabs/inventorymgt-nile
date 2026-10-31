// src/role/dto/create-role.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
export class CreateRoleDto {
  @ApiProperty({
    description: 'The role of the user',
    example: 'Admin',
  })
  @IsNotEmpty() // Ensures the value is not empty
  // Ensures the value is not empty
  role: string;
}
