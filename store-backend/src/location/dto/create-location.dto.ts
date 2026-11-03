import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLocationDto {
  @ApiProperty({ example: 'Electronics Aisle' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({ example: 'A' })
  @IsOptional()
  @IsString()
  aisle?: string;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsString()
  shelf?: string;

  @ApiPropertyOptional({ example: '01' })
  @IsOptional()
  @IsString()
  bin?: string;

  @ApiPropertyOptional({ example: 'IT Equipment' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'Main electronics storage area' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_active?: boolean;
}

/**
 * Location updates may be partial — only the fields sent by the client are
 * applied. (Previously this class extended `CreateLocationDto` directly,
 * which forced `name` on every PUT and made partial updates fail with 400.)
 */
export class UpdateLocationDto extends PartialType(CreateLocationDto) {}