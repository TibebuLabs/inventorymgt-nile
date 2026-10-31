import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

/**
 * All three approver IDs are optional because an Approvement record can be
 * created progressively (e.g., prepared_by_id first, checked_by_id later).
 * The Prisma schema reflects this with Int? (nullable) on all three fields.
 */
export class CreateApprovementDto {
  @ApiPropertyOptional({
    description: 'ID of the employee who prepared the approvement',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  prepared_by_id?: number;

  @ApiPropertyOptional({
    description: 'ID of the employee who checked the approvement',
    example: 2,
  })
  @IsOptional()
  @IsInt()
  checked_by_id?: number;

  @ApiPropertyOptional({
    description: 'ID of the employee who received the approvement',
    example: 3,
  })
  @IsOptional()
  @IsInt()
  received_by_id?: number;
}
