import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateVendorDto {
  @ApiProperty({ example: 'Ethiopian Office Supplies PLC' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({ example: 'Abebe Kebede' })
  @IsOptional()
  @IsString()
  contact_name?: string;

  @ApiPropertyOptional({ example: 'sales@eosupplies.et' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+251911234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Bole, Addis Ababa' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'TIN 0001234567' })
  @IsOptional()
  @IsString()
  tax_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_active?: boolean;
}
