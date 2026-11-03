import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateSccDto } from './create-scc.dto';

/**
 * Partial update for a Stock Control Card. Field names mirror the Prisma
 * model `Scc` (snake_case) so the payload can be spread into
 * `prisma.scc.update` without hitting `PrismaClientValidationError`.
 *
 * `item` is intentionally excluded — it is the unique natural key of the
 * card and must not be changed through an update.
 */
export class UpdateSccDto extends PartialType(
  OmitType(CreateSccDto, ['item'] as const),
) {}
