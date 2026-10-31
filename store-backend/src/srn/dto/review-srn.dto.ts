import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class ReviewSrnDto {
  @ApiPropertyOptional({ description: 'Reason (required when rejecting)' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  reason?: string;
}
