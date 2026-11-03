import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOutStockDto } from './dto/create-out-stock.dto';
import { StockService } from 'src/stock/stock.service';
import { AuditService } from 'src/audit/audit.service';
import { PrismaService } from 'prisma/prisma.service';

interface Actor {
  id?: number;
  name?: string;
  role?: string;
}

/**
 * Legacy "issue an approved SRN without a voucher" endpoint. The modern flow
 * uses POST /store-issue-voucher, but this remains for compatibility and is
 * idempotent (a fulfilled SRN cannot be issued twice).
 */
@Injectable()
export class OutStockService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stock: StockService,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreateOutStockDto, actor?: Actor) {
    const srn = await this.prisma.srn.findUnique({
      where: { id: dto.id },
      include: { srn_items: true },
    });

    if (!srn) throw new NotFoundException(`SRN #${dto.id} not found`);
    if (srn.status === 'rejected') {
      throw new BadRequestException('A rejected requisition cannot be issued');
    }
    if (srn.status === 'fulfilled') {
      throw new ConflictException(
        `SRN #${dto.id} has already been issued`,
      );
    }
    if (srn.status !== 'approved') {
      // `pending` (and any other non-approved state) must never issue stock —
      // approval is the control that authorises the movement.
      throw new BadRequestException(
        `SRN #${dto.id} must be approved before stock can be issued (current status: "${srn.status}")`,
      );
    }

    const updated = await this.stock.issueSrn(dto.id, actor?.id);

    await this.audit.log({
      employee_id: actor?.id ?? null,
      employee_name: actor?.name ?? null,
      role: actor?.role ?? null,
      action: 'SRN_ISSUE',
      entity: 'srn',
      entity_id: String(dto.id),
      description: `Issued stock for SRN #${dto.id}`,
      metadata: { items: srn.srn_items.length },
    });

    return {
      message: 'Stock issued successfully',
      itemsProcessed: srn.srn_items.length,
      srn: updated,
    };
  }
}
